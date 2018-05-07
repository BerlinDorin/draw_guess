var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
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
          util.showSuccess('登录成功')
          that.setData({
            userInfo: result,
            logged: true
          })
          console.log('登录成功', that.data.userInfo)
        } else {

          // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
          qcloud.request({
            // 这个url：`${host}/weapp/user`
            url: config.service.requestUrl,
            login: true,
            success(result) {
              util.showSuccess('登录成功')
              that.setData({
                userInfo: result.data.data,
                logged: true
              })
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

  creatRoom: function (e) {
    var that = this;
    wx.redirectTo({
      url: '/pages/draw/draw?data=' + JSON.stringify(that.data)
    })
  },
  ranking: function (e) {
    var that = this;
    wx.redirectTo({
      url: '/pages/ranking/ranking?data=' + JSON.stringify(that.data)
    })
  },
  ranking: function (e) {
    var that = this;
    wx.redirectTo({
      url: '/pages/gallery/gallery?data=' + JSON.stringify(that.data)
    })
  },
  guide: function(e){
    wx.showModal({
      title: '游戏玩法',
      content: '每个玩家轮流绘画\n画师选择一个词语绘画\n猜的人根据绘画内容猜词，猜对才能得分\n猜对人数越多，画师得分越高\n一轮后积分最高者获得胜利',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } 
      }
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