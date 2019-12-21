Page({

  data: {
    userid: '',
  },

  // 获取用户名
  onLoad: function (options) {
    var that = this

    // 查看是否授权
    wx.getSetting({
      success(res) {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              console.log(res.userInfo)
              var id = res.userInfo.nickName
              console.log(id)
              that.setData({
                userid: id
              })
              console.log(that.data.userid)
            },
            fail: (err) => {
              console.log(err)
            }
          })
        }
        else{
          that.onLoad()
        }
      }
    })
  },

  // 测试代码
  bindGetUserInfo(e) {
    console.log(e.detail.userInfo)
  },

  // 判断是否为新用户
  judge: function () {
    const db = wx.cloud.database()
    const userinfo = db.collection('user')
    console.log(this.data.userid)

    userinfo.where({
      _id: this.data.userid
    }).get()
      .then((res) => {
        console.log(res)

        // 新用户
        if (res.data.length == 0) {
          // 提示信息
          wx.showModal({
            title: '提示',
            content: '欢迎新用户！请先上传一张清晰的正脸照',
            success: (res) => {
              if (res.confirm) {
                console.log('用户点击确定')
                // 初始化新用户
                this.initUser()
              } else {
                console.log('用户点击取消')
              }
            }
          })
        }

        // 老用户
        else {
          // 提示信息
          wx.showModal({
            title: '提示',
            content: '欢迎！请拍摄一张照片完成登录',
            success: (res) => {
              if (res.confirm) {
                console.log('用户点击确定')
                // 老用户登录
                this.register()
              } else {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  },

  // 老用户登录
  register: async function () {
    var that = this

    // 提示用户等待识别结果
    wx.showLoading({
      title: '解析中...'
    });

    var imgnew = await newPhoto()
    var imgold = await oldPhoto()
    var num = await getScore(imgnew, imgold)

    // 获取得分,出错则提示用户重新上传
    try {
      var score = num.result.result.score
      console.log(score)
    }
    catch (err) {
      if (err.name == 'TypeError') {
        wx.showModal({
          title: '提示',
          content: '抱歉，图片检测出不是正脸照，请重新上传',
          success: (res) => {
            if (res.confirm) {
              console.log('用户点击确定')
              this.register()
            } else {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
    finally { wx.hideLoading() }

    // 若为识别结果为同一人，跳转至其他页面
    if (score >= 80) {
      wx.switchTab({
        url: '../list/list',
      })
    }
    // 若识别失败，提示用户重新上传一张照片
    else if (score < 80) {
      wx.showModal({
        title: '提示',
        content: '抱歉，识别失败，请重新传入一张正脸照',
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
            this.register()
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }

    // 拍摄新照片
    function newPhoto() {
      return new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['camera'],   // 仅能通过拍照上传，不允许使用相册
          success: (res) => {
            console.log(res)
            var tempFilePaths = res.tempFilePaths[0]
            var image = wx.getFileSystemManager().readFileSync(tempFilePaths, 'base64')   // 将图片进行base64编码
            resolve(image)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    }

    // 从数据库获取老照片
    function oldPhoto() {
      var id = that.data.userid
      return new Promise((resolve, reject) => {
        const db = wx.cloud.database()
        const user = db.collection('user')
        user.doc(id).get()
          .then((res) => {
            resolve(res.data.image)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }

    // 将两张照片上传到云函数，并返回比对得分
    function getScore(img_1, img_2) {
      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'faceregister',
          data: {
            img1: img_1,
            img2: img_2
          }
        })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  },



  // 新建用户
  initUser: async function () {

    var img = await getPhoto()  // 获取用户上传的照片

    // 提示用户等待活体检测结果
    wx.showLoading({
      title: '解析中...'
    });

    // 获取检测得分。若报错，则提示用户重新上传
    try {
      var score = (await getLiveness(img)).result.result.face_liveness  // 调用函数
      console.log(score)
    }
    catch (err) {
      if (err.name == 'TypeError') {
        wx.showModal({
          title: '提示',
          content: '抱歉，图片检测出不是正脸照，请重新上传',
          success: (res) => {
            if (res.confirm) {
              console.log('用户点击确定')
              this.initUser()
            } else {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
    finally { wx.hideLoading() }

    var id = this.data.userid

    // 根据得分，判断用户上传的照片是否通过活体检测
    if (score >= 0.3) {     // 通过，则建立用户数据库
      wx.showLoading({
        title: '上传中...'
      });
      buildStorage(img, id)
      wx.hideLoading()
      wx.switchTab({
        url: '../list/list',
      })
    }
    else if (score < 0.3) {  // 失败，提示用户重新上传
      wx.showModal({
        title: '提示',
        content: '抱歉，图片检测出不是正脸照，请重新上传',
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
            this.initUser()
          } else {
            console.log('用户点击取消')
          }
        }
      })
    }

    // 调用云函数，对上传的图片进行活体检测
    function getLiveness(image) {
      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'livenessvalid',
          data: {
            img: image
          }
        })
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }

    // 新用户新建数据库
    function buildStorage(img, id) {
      const db = wx.cloud.database()
      const init = db.collection('user')
      console.log(id)

      init.add({
        data: {
          _id: id,
          image: img
        }
      })
        .then((res) => {
          console.log(res)
        })
        .catch((err) => {
          console.log(err)
        })
    }

    // 获取照片信息
    function getPhoto() {
      return new Promise((resolve, reject) => {
        // 获取图片信息
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['camera'],   // 仅能通过拍照上传，不允许使用相册
          success: (res) => {

            var tempFilePaths = res.tempFilePaths[0]

            var image = wx.getFileSystemManager().readFileSync(tempFilePaths, 'base64')   // 将图片进行base64编码
            resolve(image)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    }
  },

})