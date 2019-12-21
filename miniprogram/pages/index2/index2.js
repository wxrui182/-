Page({
  data: {
    userid: ''
  },

  // 获取用户名
  onLoad: function (options) {
    wx.getUserInfo({
      success: (res) => {
        console.log(res.userInfo)
        var id = res.userInfo.nickName
        console.log(id)
        this.setData({
          userid: id
        })
      },
      fail: (err) => {
        console.log(err)
      }
    })
  },

  // 更新数据库的照片
  changePhoto: async function () {
    var that = this

    var result = await getNewPhoto().then(updateStorage)
    
    console.log(result)

    // 获取新照片
    function getNewPhoto() {
      return new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['camera'],   // 仅能通过拍照上传，不允许使用相册
          success: (res) => {
            console.log(res)
            var tempFilePaths = res.tempFilePaths[0]
            var image = wx.getFileSystemManager().readFileSync(tempFilePaths, 'base64')   // 对照片进行base64编码
            resolve(image)
          },
        })
      })
    }

    // 更新数据库
    function updateStorage(img) {
      console.log(that.data.userid)
      wx.showToast({
        title: '更新成功！',
        icon: 'success',
        duration: 1500
      })
      return new Promise((resolve, reject) => {
        const db = wx.cloud.database()
        const user = db.collection('user')
        user.doc(that.data.userid).update({
          data: {
            image: img
          }
        })
      })
    }
  }

})