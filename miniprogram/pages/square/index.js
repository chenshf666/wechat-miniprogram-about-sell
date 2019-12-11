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

  onQuery: function () {
    const db = wx.cloud.database()
    db.collection('square').get({
      success: res => {
        this.setData({
          result_array:res.data,
          queryResult: JSON.stringify(res.data, null, 2)
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  }

})