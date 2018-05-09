//app.js
var config = require('./config')
var qcloud = require('./vendor/wafer2-client-sdk/index')

App({
    onLaunch: function () {
        // setLoginUrl 方法设置登录地址之后会一直有效，因此你可以在微信小程序启动时设置。
        qcloud.setLoginUrl(config.service.loginUrl)
    },
    // 登录相关
    logged: false,
    userInfo: {},
    // tunnel相关
    tunnel: {},
    tunnelStatus: 'closed',
    // 游戏相关
    roomId: -1,
    gamerCount: 0,
    gamers: []
})