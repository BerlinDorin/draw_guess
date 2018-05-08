var qcloud = require('../vendor/wafer2-client-sdk/index')
var config = require('../config')
var util = require('./util.js')


// 手指触摸动作开始
var touchStart = function (page) {
    var pageData = page.data;
    return 
}

// 手指触摸后移动
var touchMove =  function (page) {
    var pageData = page.data;
    return 
}

//手指触摸动作结束
var touchEnd = function (page){
    var pageData = page.data;
    return function () {
        page.sendMessage('draw', pageData.actions);
        pageData.actions = [];
    }
}

// 启动橡皮擦
var clearCanvas = function (page){
    var pageData = page.data;
    return function () { pageData.isClear = !pageData.isClear; }
}

// 选择粗细
var penSelect = function (page){
    var pageData = page.data;
    return function (e) {
        pageData.isPenSelecting = !pageData.isPenSelecting;
        pageData.isClear = false;
    }
}

var penSizeChanged = function(page){
    var pageData = page.data;
    return function (e) {
        pageData.pen = parseInt(e.detail.value);
    }
}

// 更改画笔颜色
var colorSelect = function (){
    var pageData = page.data;
    return function (e) {
        pageData.color = e.currentTarget.dataset.param;
        pageData.isClear = false;
    }
}

module.exports = { touchStart, touchMove, touchEnd, clearCanvas, penSelect, penSizeChanged, colorSelect }