//index.js
const app = getApp()
var util = require('../../utils/util.js');

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    input_value:'主题',
    input_value2:'内容',
    imageChoose: false,
    imageUrl:'',
  },
  test: function(){
    console.log(this.data.input_value)
  },
  updateInputValue:function(res){
    this.setData({
      input_value:res.detail.value
    })
  },
  updateInputValue2: function (res) {
    this.setData({
      input_value2: res.detail.value
    })
  },
  doChoose: function(){
    let thisFile = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: function (res) {
        const filePath = res.tempFilePaths[0]
        thisFile.setData({
          imageChoose:true,
          imageUrl:filePath
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  doSend: function(){
    if(!app.globalData.logged){
      wx.showToast({
        icon: 'none',
        title: '你妈的先登录'
      })
      return
    }
    if(this.data.input_value.length <= 3 || !this.data.imageUrl){
      wx.showToast({
        icon: 'none',
        title: '龟龟哟，先输入4个以上字符和选择图片行不'
      })
      return
    }
    let thisFile = this
    const filePath = this.data.imageUrl
    // 上传图片
    wx.showLoading({
      title: '上传中',
    })
    const cloudPath = 'square/' + Date.now() + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        thisFile.onAdd(this.data.input_value,this.data.input_value2,res.fileID,app.globalData.userInfo)
        app.globalData.fileID = res.fileID
        app.globalData.cloudPath = cloudPath
        app.globalData.imagePath = filePath
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  onAdd: function (info,info2, url, userInfo) {
    console.log(Date.now())
    const db = wx.cloud.database()
    var time = util.formatTime(new Date());
    db.collection('square').add({
      data: {
        info:info,
        info2:info2,
        url: url,
        nick:userInfo.nickName,
        head: userInfo.avatarUrl,
        time: time
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1
        })
        wx.showToast({
          title: '新增记录成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

})
