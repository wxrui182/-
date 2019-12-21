//welcome.js
//获取应用实例
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    countDownNumber: 3,
    timerId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;

    //倒计时关闭当前页，重定向到首页
    var timer = setInterval(function () {
      page.setData({
        countDownNumber: page.data.countDownNumber - 1
      });
      if (page.data.countDownNumber == 1) {
        clearInterval(timer);
        wx.navigateTo({
          url: '/pages/entry/entry'
        })
      }
    }, 1000);
    page.setData({
      timerId: timer
    })
  },

  /**
   * 触击“欢迎页面”直接重定向到首页
   */
  goHome: function (e) {
    //清空计时器
    clearInterval(this.data.timerId);
    //关闭当前页，重定向到首页
    wx.navigateTo({
      url: '/pages/denglu/denglu'
    })
  },
  onShareAppMessage: function () {
    return {
      title: "密码托管仓库"
    }
  }

})