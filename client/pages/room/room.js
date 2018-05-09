var app = getApp()
var config = require('../../config')
var util = require('../../utils/util.js')
var loginTools = require('../../utils/loginTools')
var tunnelTools = require('../../utils/tunnelTools')
var qcloud = require('../../vendor/wafer2-client-sdk/index')

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
      gamerCount: 0,
      gamers: [],
      from: 'index',
      isRoomOwner: true,
      tunnelStatus: 'closed'
    },
    // 登录相关
    // 用户登录示例
    login: loginTools.login,
    openTunnel: tunnelTools.openTunnel,
    loginAndOpenTunnel: loginTools.loginAndOpenTunnel,

    sendMessage: tunnelTools.sendMessage,
    closeTunnel: tunnelTools.closeTunnel,

    quit: function(){
      if(this.data.from === 'index'){
        wx.navigateBack({
          delta: 1,
        })
      }else if(this.data.from == 'share'){
        wx.redirectTo({
          url: '/pages/index/index'
        })
      }
    },

    startGame: function(){
      this.sendMessage();
      app.gamerCount = this.data.gamerCount;
      app.gamers = this.data.gamers;
      // wx.navigateTo({
      //   url: '/pages/draw/draw'
      // });
    },

    // 生命周期函数
    // 监听页面加载
    onLoad: function (options) {
      util.showModel(options.roomId)
      if(options.from === 'share'){
        this.data.from = 'share'
      } 

        var defaultGamers = [];
        for(var i = 0; i < 6; ++i){
          defaultGamers.push({ avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' })
        }
        this.setData({ gamers: defaultGamers });

      if(this.data.from === "index"){
        this.openTunnel('create', app.roomId);
        var newGamers = this.data.gamers;
        newGamers[0] = app.userInfo;
        this.setData({ gamers: newGamers });
      }else if(this.data.from === 'share'){
        console.log('share')
        app.roomId = options.roomId;
        console.log(app.roomId)
        this.setData({ isRoomOwner: false })
        console.log(1)
        this.loginAndOpenTunnel('join', app.roomId);
        console.log(2)
      }
    },
    // 监听页面初次渲染完成
    onReady: function () {
      
    },
    // 监听页面显示
    onShow: function () {
      
    },
    // 监听页面隐藏
    onHide: function () {},
    // 监听页面卸载
    onUnload: function () {
      this.closeTunnel();
      app.tunnelStatus = 'closed';
    },
    //页面相关事件处理函数
    //监听用户下拉动作
    onPullDownRefresh: function () {},
    // 页面上拉触底事件的处理函数
    onReachBottom: function () {},
    // 用户点击右上角分享
    onShareAppMessage: function () {
      return {
        title: app.userInfo.nickName + '邀请你玩你画我猜',
        path: '/pages/room/room?from=share&roomId=' + app.roomId,
        imageUrl: '/imgs/2.png'
      }
    },
})