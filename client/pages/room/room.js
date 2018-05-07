var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({
    /**
     * 页面的初始数据
     */
    data: {
      imgUrls: [
        '/imgs/1.jpeg',
        '/imgs/2.png',
        '/imgs/3.jpeg'
      ],
      logged: false,
      gamerCount: 1,
      gamers: [
        { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
        { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
        { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
        { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
        { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
        { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' }
      ],
    },

    quit: function(){
      wx:wx.navigateBack({
        delta: 1,
      })
    },

    openTunnel: function () {
      util.showBusy('信道连接中...')

      // 创建信道，需要给定后台服务地址
      var tunnel = this.data.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

      console.log(tunnel)

      // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
      tunnel.on('connect', () => {
        util.showSuccess('信道已连接')
        console.log('WebSocket 信道已连接')
        this.setData({ tunnelStatus: 'connected' })
      })

      tunnel.on('close', () => {
        util.showSuccess('信道已断开')
        console.log('WebSocket 信道已断开')
        this.setData({ tunnelStatus: 'closed' })
      })

      tunnel.on('reconnecting', () => {
        console.log('WebSocket 信道正在重连...')
        util.showBusy('正在重连')
      })

      tunnel.on('reconnect', () => {
        console.log('WebSocket 信道重连成功')
        util.showSuccess('重连成功')
      })

      tunnel.on('error', error => {
        util.showModel('信道发生错误', error)
        console.error('信道发生错误：', error)
      })

      // 监听自定义消息（服务器进行推送）
      tunnel.on('speak', speak => {
        util.showModel('信道消息', speak)
        this.tunnel.emit('broadcast', { speak })
      })

      tunnel.on('draw', actions => {
        actions = actions.word;
        for (var i = 0; i < actions.length; i++) {
          wx.drawCanvas({
            canvasId: 'myCanvas',
            reserve: true,
            actions: actions[i]
          })
        }
      })

      // 打开信道
      tunnel.open()
      this.setData({ tunnelStatus: 'connecting' })
    },

    /**
     * 关闭已经打开的信道
     */
    closeTunnel() {
      if (this.data.tunnel) {
        this.data.tunnel.close();
      }
      util.showBusy('信道连接中...')
      this.setData({ tunnelStatus: 'closed' })
    },

    startGame: function(){

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log('app.roomId', app.roomId)
      if(options.from === "index"){
        var indexData = JSON.parse(options.data)
        this.setData(indexData)
        this.setData(
          { userInfo: app.userInfo }
        )
        var oldGamers = this.data.gamers;
        oldGamers[0] = this.data.userInfo;
        this.setData(
          { gamers: oldGamers,
            tunnel: app.tunnel,
            roomId: app.roomId,
            roomCount: app.roomCount
           }
        );
      }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      
    },


    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      this.closeTunnel();
    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})