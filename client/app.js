//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function () {
        // setLoginUrl 方法设置登录地址之后会一直有效，因此你可以在微信小程序启动时设置。
        qcloud.setLoginUrl(config.service.loginUrl)
    }
})