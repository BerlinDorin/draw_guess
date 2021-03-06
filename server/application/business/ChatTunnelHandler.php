<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Tunnel\ITunnelHandler as ITunnelHandler;
use \QCloud_WeApp_SDK\Tunnel\TunnelService as TunnelService;

/**
 * 实现 WebSocket 信道处理器
 * 本示例配合客户端 Demo 实现一个简单的聊天室功能
 */
class ChatTunnelHandler implements ITunnelHandler {
    private $userinfo = NULL;
    private $roomId = NULL;
    private $type = NULL;

    public function __construct ($userinfo) {
        $this->userinfo = $userinfo;
    }

    public function setRoom ($tp, $id){
        $this->roomId = $id;
        $this->type = $tp;
      }

    /**
     * 实现 onRequest 方法
     * 在客户端请求 WebSocket 信道连接之后，
     * 会调用 onRequest 方法，此时可以把信道 ID 和用户信息关联起来
     */
    public function onRequest($tunnelId, $tunnelUrl) {
        if ($this->userinfo !== NULL) {
            $data = self::loadData();
            
            $data['userMap'][$tunnelId] = $this->userinfo;  // 信道ID => 用户信息
            $data['roomMap'][$tunnelId] = $this->roomId;  // 信道ID => 房间ID
            $data['typeMap'][$tunnelId] = $this->type;  // 信道ID => type

            self::saveData($data);

            echo json_encode([
                'code' => 0,
                'data' => [
                    'connectUrl' => $tunnelUrl,
                    'tunnelId' => $tunnelId
                ]
            ]);
        }
    }

    /**
     * 实现 onConnect 方法
     * 在客户端成功连接 WebSocket 信道服务之后会调用该方法，
     * 此时通知所有其它在线的用户当前总人数以及刚加入的用户是谁
     */
    public function onConnect($tunnelId) {
        $data = self::loadData();

        if (array_key_exists($tunnelId, $data['userMap'])) {
            array_push($data['connectedTunnelIds'], $tunnelId);

            $roomId = $data['roomMap'][$tunnelId];
            $type = $data['typeMap'][$tunnelId];

            if($type === 'create'){
                $data[$roomId] = array($tunnelId);
                TunnelService::emit($tunnelId, 'debug', array('con' => $roomId));
            }else if($type === 'join'){
                if(array_key_exists($roomId, $data)){
                    array_push($data[$roomId], $tunnelId);
                    // 房间里所有人的信息
                    $allUserInfo = array();

                    foreach($data[$roomId] as $tid){
                        array_push($allUserInfo, $data['userMap'][$tid]);
                    }

                    TunnelService::emit($tunnelId, 'all people', array(
                        'total' => count($data[$roomId]),
                        'content' => $allUserInfo,
                    ));

                    self::broadcast($roomId, 'all people', array(
                        'total' => count($data[$roomId]),
                        'content' => $allUserInfo,
                    ));
                    
                    self::broadcast($roomId, 'new person', array(
                        'total' => count($data[$roomId]),
                        'enter' => $data['userMap'][$tunnelId],
                    ), true, $tunnelId);
                }else{
                    TunnelService::emit($tunnelId, 'debug', array('con' => '房间'.$roomId.'不存在'.count($data[$roomId])));
                }
            }

            self::saveData($data);

        } else {
            debug("Unknown tunnelId({$tunnelId}) was connectd, close it");
            self::closeTunnel($tunnelId);
        }
    }

    /**
     * 实现 onMessage 方法
     * 客户端推送消息到 WebSocket 信道服务器上后，会调用该方法，此时可以处理信道的消息。
     * 在本示例，我们处理 `speak` 类型的消息，该消息表示有用户发言。
     * 我们把这个发言的信息广播到所有在线的 WebSocket 信道上
     */
    public function onMessage($tunnelId, $type, $content) {
        $roomId = $data['roomMap'][$tunnelId];
        if (isset($data['userMap'][$tunnelId])) {
            switch($type){
            case 'speak':
              self::broadcast($roomId, 'speak', array(
                'who' => $data['userMap'][$tunnelId],
                'word' => $content['word']
              ));
            break;
            case 'draw':
              self::broadcast($roomId, 'draw', array(
                'content' => $content['content'],
              ), true, $tunnelId);
            break;
            }
          } else {
              self::closeTunnel($tunnelId);
          }
    }

    /**
     * 实现 onClose 方法
     * 客户端关闭 WebSocket 信道或者被信道服务器判断为已断开后，
     * 会调用该方法，此时可以进行清理及通知操作
     */
    public function onClose($tunnelId) {
        $data = self::loadData();

        if (!array_key_exists($tunnelId, $data['userMap'])) {
            debug('[onClose] 无效的信道 ID =>', $tunnelId);
            self::closeTunnel($tunnelId);
            return;
        }

        $leaveUser = $data['userMap'][$tunnelId];
        unset($data['userMap'][$tunnelId]);

        $roomId = $data['roomMap'][$tunnelId];

        $index = array_search($tunnelId, $data[$roomId]);
        if ($index !== FALSE) {
            array_splice($data[$roomId], $index, 1);
        }

        // 聊天室没有人了（即无信道ID）不再需要广播消息
        if (count($data[$roomId]) > 0) {
            self::broadcast($roomId, 'someone leave', array(
                'total' => count($data[$roomId]),
                'leave' => $leaveUser,
            ));
        }else{
            unset($data[$roomId]);
        }

        self::saveData($data);
    }

    /**
     * 调用 TunnelService::broadcast() 进行广播
     */
    private static function broadcast($roomId, $type, $content, $mask=false, $tunnelIdToMask=0) {
        $data = self::loadData();
        $tunnelIds = NULL;

        if($mask){
            $tunnelIds = $data[$roomId];
            $index = array_search($tunnelIdToMask, $data[$roomId]);
            array_splice($tunnelIds, $index, 1);
        }else{
            $tunnelIds = &$data[$roomId];
        }

        $result = TunnelService::broadcast($tunnelIds, $type, $content);

        if ($result['code'] === 0 && !empty($result['data']['invalidTunnelIds'])) {
            $invalidTunnelIds = $result['data']['invalidTunnelIds'];
            debug('检测到无效的信道 IDs =>', $invalidTunnelIds);

            // 从`userMap`和`connectedTunnelIds`将无效的信道记录移除
            foreach ($invalidTunnelIds as $tunnelId) {
                unset($data['userMap'][$tunnelId]);

                $index = array_search($tunnelId, $data[$roomId]);
                if ($index !== FALSE) {
                    array_splice($data[$roomId], $index, 1);
                }
            }

            self::saveData($data);
        }
    }

    /**
     * 调用 TunnelService::closeTunnel() 关闭信道
     * @param  String $tunnelId 信道ID
     */
    private static function closeTunnel($tunnelId) {
        TunnelService::closeTunnel($tunnelId);
    }

    /**
     * 加载 WebSocket 信道对应的用户 => userMap
     * 加载 当前已连接的 WebSocket 信道列表 => connectedTunnelIds
     * 在实际的业务中，应该使用数据库进行存储跟踪，这里作为示例只是演示其作用
     */
    private static function loadData() {
        $filepath = self::getDataFilePath();
        $defaultData = array('userMap' => array(), 'connectedTunnelIds' => array());

        if (!file_exists($filepath)) {
            return $defaultData;
        }

        $content = file_get_contents($filepath);
        $data = json_decode($content, TRUE);

        return (is_array($data) ? $data : $defaultData);
    }

    /**
     * 保存 WebSocket 信道对应的用户 => userMap
     * 保存 当前已连接的 WebSocket 信道ID列表 => connectedTunnelIds
     * 在实际的业务中，应该使用数据库进行存储跟踪，这里作为示例只是演示其作用
     */
    private static function saveData($data) {
        $filepath = self::getDataFilePath();

        if (version_compare(PHP_VERSION, '5.4.0') >= 0) {
            $content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        } else {
            $content = json_encode($data);
        }

        file_put_contents($filepath, $content, LOCK_EX);
    }

    /**
     * 聊天室存取 JSON 数据对应的文件路径
     */
    private static function getDataFilePath() {
        return (dirname(__FILE__) . DIRECTORY_SEPARATOR . 'chat_data.json');
    }
}
