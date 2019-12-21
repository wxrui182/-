//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    this.globalData = {}
    var testDATA = {
      1496038089341: {
        password: "sdfwewrwerwer",
        tag: "京东",
        username: "x04440x",
        isCheckTimeout: true,
        timeoutDate: "2017-1-1"
      },
      1496038089342: {
        password: "erwerDCERDWER",
        tag: "京西",
        username: "x04440x",
        isCheckTimeout: true,
        timeoutDate: "2018-01-01"
      },
      1496038089343: {
        password: "RFWE$#5%####",
        tag: "京南",
        username: "x04440x",
        isCheckTimeout: true,
        timeoutDate: "2017-5-4"
      },
      1496038089344: {
        password: "fd#45?><_+}{g",
        tag: "京北",
        username: "x04440x",
        isCheckTimeout: false,
        timeoutDate: "2017-12-12"
      }
    };
    this.DATA = wx.getStorageSync('DATA') || {};

    var testCONFIG = {

      //自动生成随机密码的条件
      autoGenerate_num: false,
      autoGenerate_symbol: true,
      autoGenerate_upcase: true,
      autoGenerate_lowcase: true,

      autoGenerate_range: [6, 8, 11, 13, 17],
      autoGenerate_size_index: 0
    }
    this.CONFIG = wx.getStorageSync('CONFIG') || testCONFIG;
  },
  saveDATA: function () {
    wx.setStorageSync('DATA', this.DATA)
  },
  saveCONFIG: function () {
    wx.setStorageSync('CONFIG', this.CONFIG)
  }
})