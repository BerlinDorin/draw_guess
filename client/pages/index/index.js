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

  },
  // 登录相关
  login: loginTools.login,
  loginAndOpenTunnel: loginTools.loginAndOpenTunnel,
  // tunnel相关
  openTunnel: tunnelTools.openTunnel,
  sendMessage: tunnelTools.sendMessage,
  closeTunnel: tunnelTools.closeTunnel,
  // 创建房间
  creatRoom: function (e) {
    app.roomId = app.userInfo.openId;
    wx.navigateTo({
      url: '/pages/room/room?from=index'
      // url: '/pages/room/room?from=share&roomId=' + app.roomId
    });
  },

  index2: function (e) {
    wx.navigateTo({
      url: '/pages/index2/index'
    })
  },

  // 生命周期函数
  // 监听页面加载
  onLoad: function (options) {
    this.login();
  },
  // 监听页面初次渲染完成
  onReady: function () {},
  // 监听页面显示
  onShow: function () {},
  // 监听页面隐藏
  onHide: function () {},
  // 监听页面卸载
  onUnload: function () {},

  //页面相关事件处理函数
  //监听用户下拉动作
  onPullDownRefresh: function () {},
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {},
  // 用户点击右上角分享
  onShareAppMessage: function () {},
})