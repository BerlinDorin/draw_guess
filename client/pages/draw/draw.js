var app = getApp()
var config = require('../../config')
var util = require('../../utils/util.js')
var drawTools = require('../../utils/drawTools')
var loginTools = require('../../utils/loginTools')
var tunnelTools = require('../../utils/tunnelTools')
var qcloud = require('../../vendor/wafer2-client-sdk/index')


Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 画板相关
    pen: 3,                                                            // 画笔粗细
    startX: 0,                                                         // X坐标轴变量
    startY: 0,                                                         // Y坐标轴变量
    isClear: false,                                                    // 是否启用橡皮擦
    color: '#cc0033',                                                  // 画笔颜色
    // 页面绑定
    hint: 3,                                                           // 提示答案有几个字
    gamerCount: 0,                                                     // 玩家人数 
    inputValue: "",                                                    // 输入框内容
    chatContent: "",                                                   // 聊天内容
    showNickName: false,                                               // 是否显示昵称
    hint_category: "花朵",                                              // 提示答案的种类
    isPenSelecting: false,                                             // 是否在选择笔的粗细
    gameState: "游戏进行中",                                             // 游戏状态
    placeholder: "输入您的答案",                                         // 输入框placeholder
    colors: [
      {colorName: "Black", value: "#000000"},
      {colorName: "Lime", value: "#00FF00"},
      {colorName: "OrangeRed", value: "#FF4500"},
      {colorName: "Yellow", value: "#FFFF00"},
      {colorName: "Orange", value: "#FFA500"},
      {colorName: "DeepSkyBlue", value: "#00BFFF"}
    ],
    gamers: [
      { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
      { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
      { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
      { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
      { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' },
      { avatarUrl: '/imgs/user-unlogin.png', nickName: 'None' }
    ],
    // 游戏逻辑
    myTurn: true,
    // 其他
    actions: []
  },

  // 登录相关
  login: loginTools.login,
  loginAndOpenTunnel: loginTools.loginAndOpenTunnel,
  // tunnel相关
  openTunnel: tunnelTools.openTunnel,
  sendMessage: tunnelTools.sendMessage,
  closeTunnel: tunnelTools.closeTunnel,
  // 画板相关
  touchStart: function (e) {
    var page = this;
    page.data.startX = e.changedTouches[0].x
    page.data.startY = e.changedTouches[0].y
    page.data.context = wx.createContext()
    if (page.data.isClear) {
        page.data.context.setStrokeStyle('#FFFFFF')                                              // 设置线条样式
        page.data.context.setLineCap('round')                                                    // 设置线条端点的样式
        page.data.context.setLineJoin('round')                                                   // 设置两线相交处的样式
        page.data.context.setLineWidth(20)                                                       // 设置线条宽度
        page.data.context.save();                                                                // 保存当前坐标轴的缩放、旋转、平移信息
        page.data.context.beginPath()                                                            // 开始一个路径
        page.data.context.arc(page.data.startX, page.data.startY, 5, 0, 2 * Math.PI, true);      // 添加一个弧形路径到当前路径，顺时针绘制  这里总共画了360度  也就是一个圆形
        page.data.context.fill();                                                                // 对当前路径进行填充
        page.data.context.restore();                                                             // 恢复之前保存过的坐标轴的缩放、旋转、平移信息
    } else {
        page.data.context.setStrokeStyle(page.data.color)
        page.data.context.setLineWidth(page.data.pen)
        page.data.context.setLineCap('round')
        page.data.context.beginPath()
    }
  },
  touchMove: function (e) {
    var page = this;
    var pageData = this.data;
    var startX1 = e.changedTouches[0].x
    var startY1 = e.changedTouches[0].y
    if (pageData.isClear) { 
        pageData.context.save();                                                                // 保存当前坐标轴的缩放、旋转、平移信息
        pageData.context.moveTo(pageData.startX, pageData.startY);                              // 把路径移动到画布中的指定点，但不创建线条
        pageData.context.lineTo(startX1, startY1);                                              // 添加一个新点，然后在画布中创建从该点到最后指定点的线条
        pageData.context.stroke();                                                              // 对当前路径进行描边
        pageData.context.restore()                                                              // 恢复之前保存过的坐标轴的缩放、旋转、平移信息
        pageData.startX = startX1;
        pageData.startY = startY1;
    } else {
        pageData.context.moveTo(pageData.startX, pageData.startY)
        pageData.context.lineTo(startX1, startY1)
        pageData.context.stroke()
        pageData.startX = startX1;
        pageData.startY = startY1;
    }
    var action = pageData.context.getActions();                                                 // content是一个记录方法调用的容器，用于生成记录绘制行为的actions数组
    wx.drawCanvas({                                                                             // context跟canvas不存在对应关系，一个context可以应用于多个canvas
        canvasId: 'myCanvas',
        reserve: true,
        actions: action
    })
    pageData.actions.push(action)
    if(action.length > 10){
        page.sendMessage('draw', { 'content': actions });
        page.setData({ actions: []})
    }
  },
  touchEnd: function () {
    var page = this;
    var pageData = this.data;
    page.sendMessage('draw', pageData.actions);
    pageData.actions = [];
  },
  clearCanvas: function () { this.data.isClear = !this.data.isClear; },
  penSelect: function (e) {
    var page = this;
    var pageData = this.data;
    pageData.isPenSelecting = !pageData.isPenSelecting;
    pageData.isClear = false;
  },
  penSizeChanged: function (e) {
    var pageData = this.data;
    pageData.pen = parseInt(e.detail.value);
  },
  colorSelect: function (e) {
    var page = this;
    var pageData = this.data;
    pageData.color = e.currentTarget.dataset.param;
    pageData.isClear = false;
},
  
  // 输入框绑定方法
  onFocus: function (e){
    this.setData({ placeholder: ''});
  },
  onblur: function (e){
    this.setData({ placeholder: '输入您的答案' });
  },
  onSubmit: function (e){
    var oldContent = this.data.chatContent;
    this.setData({
      chatContent: oldContent + (oldContent === '' ? '' : '\n') + this.data.inputValue,
      inputValue: ''
    });
  },
  onInput: function (e) {
    this.setData({ inputValue: e.detail.value})
  },

  // 生命周期函数
  // 监听页面加载
  onLoad: function (options) {
    this.loginAndOpenTunnel();
  },
  // 监听页面初次渲染完成
  onReady: function () {},
  // 监听页面显示
  onShow: function () {},
  // 监听页面隐藏
  onHide: function () {},

  // 监听页面卸载
  onUnload: function () {
    this.closeTunnel();
  },

  //页面相关事件处理函数
  //监听用户下拉动作
  onPullDownRefresh: function () {},
  // 页面上拉触底事件的处理函数
  onReachBottom: function () {},
  // 用户点击右上角分享
  onShareAppMessage: function () {},
})