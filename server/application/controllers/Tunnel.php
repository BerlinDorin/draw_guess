<?php
defined('BASEPATH') OR exit('No direct script access allowed');

use \QCloud_WeApp_SDK\Tunnel\TunnelService as TunnelService;
use \QCloud_WeApp_SDK\Auth\LoginService as LoginService;
use QCloud_WeApp_SDK\Constants as Constants;

require APPPATH.'business/ChatTunnelHandler.php';

class Tunnel extends CI_Controller {
    public function index() {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $result = LoginService::check();
            
            if ($result['loginState'] === Constants::S_AUTH) {
                $handler = new ChatTunnelHandler($result['userinfo']);
                TunnelService::handle($handler, array('checkLogin' => TRUE));
            } else {
                $this->json([
                    'code' => -1,
                    'data' => []
                ]);
            }
        }
        // 这里更改为只有登陆后才能打开信道
        else {
                $this->json([
                    'code' => -1,
                    'data' => []
                ]);
        }
        // 原来的代码
        // else {
        //     $handler = new ChatTunnelHandler([]);
        //     TunnelService::handle($handler, array('checkLogin' => FALSE));
        // }
    }
}
