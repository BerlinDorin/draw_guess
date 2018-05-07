var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    logged: false,
    tunnel: {}
  },

  /**
   * 用户登录
   */
  login: function () {
    // 在app.js中已经执行了setLoginUrl
    // 如果已经登录，直接返回
    if (this.data.logged)
      return

    util.showBusy('正在登录')
    var that = this

    // 调用登录接口
    qcloud.login({
      success(result) {
        if (result) {
          // util.showSuccess('登录成功')
          that.setData({
            userInfo: result,
            logged: true
          })
          that.openTunnel();
          console.log('登录成功', that.data.userInfo)
        } else {

          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            // 这个url：`${host}/weapp/user`
            url: config.service.requestUrl,
            login: true,
            success(result) {
              // util.showSuccess('登录成功')
              that.setData({
                userInfo: result.data.data,
                logged: true
              })
              that.openTunnel();
              console.log('登录成功', that.data.userInfo)
            },

            fail(error) {
              // 改为登录失败 请重试
              util.showModel('登录失败，请重试')
              //util.showModel('请求失败', error)
              console.log('请求失败', error)
            }
          })
        }
      },

      fail(error) {
        util.showModel('登录失败, 请重试')
        console.log('登录失败', error)
      }
    })
  },

  openTunnel: function () {
    // util.showBusy('信道连接中...')

    // 创建信道，需要给定后台服务地址
    var tunnel = this.data.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

    console.log(tunnel)

    // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
    tunnel.on('connect', () => {
      // util.showSuccess('信道已连接')
      util.showSuccess('登录成功')
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
      // util.showModel('信道消息', speak)
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

  /**
   * 创建房间
   */
  creatRoom: function (e) {
    util.showBusy('加载中')
    var that = this;
    qcloud.request({
      url: `${config.service.host}/weapp/room`,
      login: that.data.logged,
      success(result) {
        // console.log(result);
        app.tunnel = that.data.tunnel;
        app.userInfo = that.data.userInfo;
        app.roomId = result.data.roomId;
        app.roomCount = result.data.roomCount;

        var data = {
          logged: that.data.logged,
        }
        wx.navigateTo({
          url: '/pages/room/room?from=index&data=' + JSON.stringify(data)
        })
      },
      fail(error) {
        util.showModel('请求失败', error);
        console.log('request fail', error);
      }
    })
  },

  index2: function (e) {
    wx.navigateTo({
      url: '/pages/index2/index'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.login();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})