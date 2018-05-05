var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pen: 3,           //画笔粗细默认值
    color: '#cc0033', //画笔颜色默认值

    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    leftTime:60,
    gameState: "游戏进行中",
    myTurn: true,
    colors: [
      {colorName: "Black", value: "#000000"},
      {colorName: "Lime", value: "#00FF00"},
      {colorName: "OrangeRed", value: "#FF4500"},
      { colorName: "Yellow", value: "#FFFF00"},
      {colorName: "Orange", value: "#FFA500"},
      {colorName: "DeepSkyBlue", value: "#00BFFF"}
    ],
    isPenSelecting: false,
    hint: 3,
    hint_category: "花朵",
    placeholder: "输入您的答案",
    chatContent: "",
    inputValue: "",
    gamers: [
      { img: './user-unlogin.png', nickName: 'Exupery' },
      { img: './user-unlogin.png', nickName: '啊啊啊啊' },
      { img: './user-unlogin.png', nickName: '789' },
      { img: './user-unlogin.png', nickName: '987' },
      { img: './user-unlogin.png', nickName: '654' },
      { img: './user-unlogin.png', nickName: '321' }
    ],
    showNickName: false,
    gamerCount: 0,
  },

  openTunnel: function () {
    // 对用户隐藏信道
    // util.showBusy('信道连接中...')

    // 创建信道，需要给定后台服务地址
    var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

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

    tunnel.on('draw', e => {
      wx.drawCanvas({
        canvasId: 'myCanvas',
        reserve: true,
        actions: e.word
      })
    })

    // 打开信道
    tunnel.open()
    this.setData({ tunnelStatus: 'connecting' })
  },

  /**
   * 使用信道发送消息
   */
  sendMessage(Type, word) {
    if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') 
      return
    
    // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
    if (this.tunnel && this.tunnel.isActive()) {
      // 使用信道给服务器推送「speak」消息
      this.tunnel.emit(Type, {
        'word': word,
      });
    }
  },

  /**
   * 关闭已经打开的信道
   */
  closeTunnel() {
    if (this.tunnel) {
      this.tunnel.close();
    }
    util.showBusy('信道连接中...')
    this.setData({ tunnelStatus: 'closed' })
  },

  startX: 0,      // 保存X坐标轴变量
  startY: 0,      // 保存Y坐标轴变量
  isClear: false, // 是否启用橡皮擦标记

  /**
   * 手指触摸动作开始
   */
  touchStart: function (e) {
    //得到触摸点的坐标
    this.startX = e.changedTouches[0].x
    this.startY = e.changedTouches[0].y
    this.context = wx.createContext()

    // 判断是否启用的橡皮擦功能  ture表示清除  false表示画画
    if (this.isClear) { 
      // 设置线条样式 此处设置为画布的背景颜色  橡皮擦原理就是：利用擦过的地方被填充为画布的背景颜色一致 从而达到橡皮擦的效果
      this.context.setStrokeStyle('#FFFFFF')
      // 设置线条端点的样式
      this.context.setLineCap('round')
      // 设置两线相交处的样式
      this.context.setLineJoin('round')
      // 设置线条宽度
      this.context.setLineWidth(20)
      // 保存当前坐标轴的缩放、旋转、平移信息
      this.context.save();
      // 开始一个路径
      this.context.beginPath()
      // 添加一个弧形路径到当前路径，顺时针绘制  这里总共画了360度  也就是一个圆形
      this.context.arc(this.startX, this.startY, 5, 0, 2 * Math.PI, true);
      // 对当前路径进行填充
      this.context.fill();
      // 恢复之前保存过的坐标轴的缩放、旋转、平移信息
      this.context.restore();
    } else {
      this.context.setStrokeStyle(this.data.color)
      this.context.setLineWidth(this.data.pen)
      // 让线条圆润
      this.context.setLineCap('round')
      this.context.beginPath()

    }
  },
  
  /**
   * 手指触摸后移动
   */
  touchMove: function (e) {
    var startX1 = e.changedTouches[0].x
    var startY1 = e.changedTouches[0].y

    //判断是否启用的橡皮擦功能  ture表示清除  false表示画画
    if (this.isClear) { 

      this.context.save();                            // 保存当前坐标轴的缩放、旋转、平移信息
      this.context.moveTo(this.startX, this.startY);  // 把路径移动到画布中的指定点，但不创建线条
      this.context.lineTo(startX1, startY1);          // 添加一个新点，然后在画布中创建从该点到最后指定点的线条
      this.context.stroke();                          // 对当前路径进行描边
      this.context.restore()                          // 恢复之前保存过的坐标轴的缩放、旋转、平移信息

      this.startX = startX1;
      this.startY = startY1;

    } else {
      this.context.moveTo(this.startX, this.startY)
      this.context.lineTo(startX1, startY1)
      this.context.stroke()

      this.startX = startX1;
      this.startY = startY1;
    }

    // content是一个记录方法调用的容器，用于生成记录绘制行为的actions数组。
    // context跟<canvas/>不存在对应关系，一个context生成画布的绘制动作数组可以应用于多个<canvas/>

    var actions = this.context.getActions();

    wx.drawCanvas({
      canvasId: 'myCanvas',
      reserve: true,
      actions: actions // 获取绘图动作数组
    })

    this.sendMessage('draw', actions);
  },

  /**
   * 手指触摸动作结束
   */
  touchEnd: function () {

  },

  /**
   * 启动橡皮擦
   */
  clearCanvas: function () {
    this.isClear = !this.isClear;
  },
  
  /**
   * 显示滑动条
   */
  penSelect: function (e) {
    var now = this.data.isPenSelecting;
    this.setData({isPenSelecting: !now})
    this.isClear = false;
  },

  penSizeChanged: function (e) {
    console.log(e)
    this.setData({ pen: parseInt(e.detail.value) });
  },

  /**
   * 更改画笔颜色
   */
  colorSelect: function (e) {
    console.log(e.currentTarget);
    this.setData({ color: e.currentTarget.dataset.param });
    this.isClear = false;
  },

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var indexData = JSON.parse(options.data)
    
    this.setData(
      {userInfo : indexData.userInfo}
    )
    console.log(this.data.userInfo)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.openTunnel();
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
    this.closeTunnel();
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