var app = getApp()
var util = require('./util.js')
var config = require('../config')
var qcloud = require('../vendor/wafer2-client-sdk/index')

var page = this;


// 打开信道
var openTunnel =  function(op, roomId){
  util.showBusy('信道连接中...');
  // var tunnel = app.tunnel = new qcloud.Tunnel(config.service.tunnelUrl);
  var tunnel = app.tunnel = new qcloud.Tunnel(config.service.tunnelUrl + '/index/' + op + '/' + roomId);
  var that = this;

  console.log('openTunnel',op,roomId)

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
  });

  tunnel.on('new person', data => {
    util.showModel('new person', data)
    console.log('信道消息: new pweson', data.total, data.enter)
    this.data.gamerCount = data.total;
    this.data.gamers.push(data.enter);
  });

  tunnel.on('all people', data => {
    var newGamers = data.content;
    
    while(newGamers.length <6){
      newGamers.push(this.data.gamers[5])
    }
    util.showModel('newGamers', newGamers)
    this.setData({
      gamers: newGamers,
      gamerCount: data.total
    });
    util.showModel('all people', data)
    console.log('all people', data);
  });

  tunnel.on('someone leave', data => {
    util.showModel('信道消息', data);
    this.data.gamerCount = data.total;
    this.data.gamers.remove(data.leave);
    if(this.data.gamerCount !== this.data.gamers.length){
      util.showModel('error:someone leave', 'this.gamerCount !== this.gamers.length');
    }
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

  tunnel.on('debug', data => {
    console.log('debug', data);
    util.showModel('debug', data);
  });


  // 打开信道
  tunnel.open();
  console.log("ddd");
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
  console.log("aaa")
  console.log(app.tunnel)
  console.log(app.tunnel.isActive())
  if (app.tunnel && app.tunnel.isActive()) {
    console.log("bbb")
    app.tunnel.emit(messageType, message);
  }
}

// 关闭已经打开的信道
var closeTunnel = function () {
  if (app.tunnel) {
    app.tunnel.close();
  }
  util.showBusy('信道关闭中...');
  app.tunnelStatus = 'closed';
  util.showSuccess('信道已关闭');
}

var setPage = function () {
  
}

module.exports = { openTunnel, sendMessage, closeTunnel }