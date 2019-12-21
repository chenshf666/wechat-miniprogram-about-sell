//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: '',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  toMy: function(){
    wx.navigateTo({
      url: '../My/index',
    })
  },
  onReady: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.logged = true
              app.globalData.userInfo = res.userInfo
              this.SaveUserInfo(res.userInfo)
              this.setData({
                logged: true,
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.SaveUserInfo(e.detail.userInfo)
      app.globalData.logged = true
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  Create : function(userInfo){
    console.log('In create')
    const db = wx.cloud.database()
    db.collection('openid2userInfo').add({
      data: {
        head: userInfo.avatarUrl,
        nickName: userInfo.nickName
      }
    })
  },
  Update : function(_id,userInfo){
    const db = wx.cloud.database()
    db.collection('openid2userInfo').doc(_id).update({
      // data 传入需要局部更新的数据
      data: {
        head: userInfo.avatarUrl,
        nickName: userInfo.nickName
      }
    })
  },
  SaveUserInfo : function(userInfo){
    const db = wx.cloud.database()
    db.collection('openid2userInfo').where({
      _openid : app.globalData.openid
    }).get({
      success: res => {
        if(res.data.length < 1){
          this.Create(userInfo)
        }else{
          this.Update(res.data[0]._id,userInfo)
        }
      }
    })
  }
})
