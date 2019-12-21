// 活体检测云函数（即判断照片是否为真人）

// 云函数入口文件
const cloud = require('wx-server-sdk')
var request = require('request')

const url = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=BuQsR3YwFcHaQ2D4IvLO8Zpf&client_secret=ZQAQ7W7WPggLy4AgmlGr4Ar0CNTXcsBa'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取得分
  var score = await getAccessToken().then(getScore)
  console.log(score)
  return score

  // 发送请求，获取百度ai的access_token
  function getAccessToken() {
    return new Promise((resolve, reject) => {
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body).access_token)
        } else { reject(error) }
      })
    })
  }

  // 将照片作为请求参数，调用百度ai活体检测api
  function getScore(accesstoken) {
    // post 参数
    const url_ai = 'https://aip.baidubce.com/rest/2.0/face/v3/faceverify?access_token=' + accesstoken
    const header = { 'Content-Type': 'application/json' }
    const data = [{
      'image': event.img,
      'image_type': 'BASE64'
    }]

    return new Promise((resolve, reject) => {

      request({
        url: url_ai,
        method: "POST",
        json: true,
        headers: header,
        body: data,
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            resolve(body)
          } else { reject(error) }
        }
      )
    })
  }
}