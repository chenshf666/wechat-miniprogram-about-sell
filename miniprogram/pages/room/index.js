// pages/databaseGuide/databaseGuide.js

const app = getApp()

Page({

  data: {
    openid: '',
    queryResult: '',
    result_array:[]
  },

  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
  },
  toChat: function(event){
    app.globalData.roomid = event.currentTarget.dataset.roomid
    wx.navigateTo({
      url: '../chat/room',
    })
  },
  onQuery: function () {
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('openid2roomid').where(_.or([
      {
        openid1: app.globalData.openid,
      },
      {
        openid2: app.globalData.openid,
      }
    ])).get({
      success: res => {
        this.setData({
          result_array: res.data,
          queryResult: JSON.stringify(res.data, null, 2)
        })
      },
      fail: err => {
      }
    })
  }

})