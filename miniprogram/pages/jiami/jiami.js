var fun_aes = require('../../utils/aes.js')
var app = getApp()
//十六位十六进制数作为秘钥
var key = fun_aes.CryptoJS.enc.Utf8.parse("3454345434543454");
//十六位十六进制数作为秘钥偏移量
var iv = fun_aes.CryptoJS.enc.Utf8.parse('6666666666666666');
Page({
  data: {
    tags: "",
    username: "",
    password: "",
  },
  // 将输入的内容同步到page对象的data中
  tagInput: function(e) {
    this.data.tag = e.detail.value
  },
  usernameInput: function(e) {
    this.data.username = e.detail.value
  },
  passwordInput: function(e) {
    this.data.password = e.detail.value
  },
  saveNewPassword: function() {
    var db = wx.cloud.database()
    db.collection("password").add({
      data: {
        _id: this.data.tag,
        username: this.Encrypt(this.data.username),
        password: this.Encrypt(this.data.password)
      },
      success: function(res) {
        console.log(res)
      }
    })
  },
  UpdataNewPassword: function() {

    var db = wx.cloud.database()

    db.collection('password').doc(this.data.tag).update({
        // data 传入需要局部更新的数据
        data: {
          username: this.Encrypt(this.data.username),
          password:this.Encrypt(this.data.password)
        }
      })
      .then((res) => {
        console.log(res)
      })
      wx.showToast({
        title: '更新密码成功',
        icon: 'success',
        duration: 1500
      })

  },
  QueryPassword: function() {
    var that =this
    var db = wx.cloud.database()
    db.collection('password').doc(this.data.tag).get({
      success: function (res) {
        res.data 
        console.log(res.data)
        var password=res.data.password
        var username=res.data.username
        that.setData({
          password:that.Decrypt(password),
          username:that.Decrypt(username)
        })
        
      }
    })

    
  },
  Encrypt: function (word) {
    var srcs = fun_aes.CryptoJS.enc.Utf8.parse(word);
    var encrypted = fun_aes.CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: fun_aes.CryptoJS.mode.CBC, padding: fun_aes.CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
  },
  Decrypt: function (word) {
    var encryptedHexStr = fun_aes.CryptoJS.enc.Hex.parse(word);
    var srcs = fun_aes.CryptoJS.enc.Base64.stringify(encryptedHexStr);
    var decrypt = fun_aes.CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: fun_aes.CryptoJS.mode.CBC, padding: fun_aes.CryptoJS.pad.Pkcs7 });
    var decryptedStr = decrypt.toString(fun_aes.CryptoJS.enc.Utf8);
    return decryptedStr.toString();
  }
})