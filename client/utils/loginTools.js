var app = getApp();
var util = require('./util.js')
var config = require('../config')
var tunnelTools = require('./tunnelTools')
var qcloud = require('../vendor/wafer2-client-sdk/index')

// 用户登录
var login = function () {
    if (app.logged)
      return
    util.showBusy('正在登录')
    qcloud.login({
        success(result) {
            if (result) {
                util.showSuccess('登录成功');
                app.userInfo = result;
                app.logged = true;
                console.log('登录成功', app.userInfo);
            } else {
                // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                qcloud.request({
                    url: config.service.requestUrl,
                    login: true,
                    success(result) {
                        util.showSuccess('登录成功')
                        app.userInfo = result.data.data
                        app.logged = true
                        console.log('登录成功', app.userInfo)
                    },
                    fail(error) {
                    util.showModel('请求失败', error)
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
  }

  var loginAndOpenTunnel = function () {
    if (app.logged)
    return
    util.showBusy('正在登录')
    qcloud.login({
        success(result) {
            if (result) {
                util.showSuccess('登录成功');
                app.userInfo = result;
                app.logged = true;
                console.log('登录成功', app.userInfo);
                tunnelTools.openTunnel();
            } else {
                // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                qcloud.request({
                    url: config.service.requestUrl,
                    login: true,
                    success(result) {
                        util.showSuccess('登录成功')
                        app.userInfo = result.data.data
                        app.logged = true
                        console.log('登录成功', app.userInfo)
                        tunnelTools.openTunnel();
                    },
                    fail(error) {
                    util.showModel('请求失败', error)
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
  }

  module.exports = { login, loginAndOpenTunnel }