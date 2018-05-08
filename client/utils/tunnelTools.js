var app = getApp()
var util = require('./util.js')
var config = require('../config')
var qcloud = require('../vendor/wafer2-client-sdk/index')


// 打开信道
var openTunnel =   function(){
  util.showBusy('信道连接中...');
  var tunnel = app.tunnel = new qcloud.Tunnel(config.service.tunnelUrl);

  // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
  tunnel.on('connect', () => {
    util.showSuccess('信道已连接')
    console.log('WebSocket 信道已连接')
    app.tunnelStatus = 'connected'
  });

  tunnel.on('close', () => {
    util.showSuccess('信道已断开')
    console.log('WebSocket 信道已断开')
    app.tunnelStatus = 'closed'
  });

  tunnel.on('reconnecting', () => {
    console.log('WebSocket 信道正在重连...')
    util.showBusy('正在重连')
  });

  tunnel.on('reconnect', () => {
    console.log('WebSocket 信道重连成功')
    util.showSuccess('重连成功')
  });

  tunnel.on('error', error => {
    util.showModel('信道发生错误', error)
    console.error('信道发生错误：', error)
  });

  // 监听自定义消息（服务器进行推送）
  tunnel.on('speak', speak => {
    util.showModel('信道消息', speak)
    app.tunnel.emit('broadcast', { speak })
  });

  tunnel.on('draw', actions => {
    actions = actions.word;
    for (var i = 0; i < actions.length; i++) {
      wx.drawCanvas({
        canvasId: 'myCanvas',
        reserve: true,
        actions: actions[i]
      })
    }
  });

  // 打开信道
  tunnel.open();
  app.tunnelStatus = 'connecting';
}

// 使用信道发送消息
var sendMessage = function (messageType, message) {
  if (!app.tunnelStatus || !app.tunnelStatus === 'connected'){
    console.log('发送消息失败，tunnelStatus不存在或不等于commected');
    console.log('mseeageType', messageType);
    console.log('message', message);
    return;
  }
  // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
  if (app.tunnel && app.tunnel.isActive()) {
    app.tunnel.emit(messageType, message);
  }
}

// 关闭已经打开的信道
var closeTunnel = function () {
  if (app.tunnel) {
    app.tunnel.close();
  }
  util.showBusy('信道关闭中...');
  this.setData({ tunnelStatus: 'closed' });
  util.showSuccess('信道已关闭');
}

module.exports = { openTunnel, sendMessage, closeTunnel }