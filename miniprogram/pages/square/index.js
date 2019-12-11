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
  onImageTap(e) {
    wx.previewImage({
      urls: [e.target.dataset.fileid],
    })
  },
  test: function(event){
    const target_openid = event.currentTarget.dataset.openid
    if(target_openid == app.globalData.openid){
      wx.showToast({
        icon: 'none',
        title: '别想和自己说话嗷'
      })
      return
    }

    // 查询聊天是否已经创建
    const db = wx.cloud.database()
    const _ = db.command
    let result = []
    let roomid = ''
    db.collection('openid2roomid').where(_.or([
      {
        openid1:app.globalData.openid,
        openid2:target_openid
      },
      {
        openid2: app.globalData.openid,
        openid1: target_openid
      }
      ])).get({
      success: res => {
        result = res.data
        if (result.length < 1) {
          //如果没有创建则创建记录，roomid为两个openid相加
          db.collection('openid2roomid').add({
            data: {
              openid1: app.globalData.openid,
              openid2: target_openid,
              roomid: app.globalData.openid + target_openid
            },
            success: res => {
              roomid = app.globalData.openid + target_openid
              app.globalData.roomid = roomid
              wx.navigateTo({
                url: '../chat/room',
              })
            },
            fail: err => {
            }
          })
        } else {
          roomid = result[0].roomid
          app.globalData.roomid = roomid
          wx.navigateTo({
            url: '../chat/room',
          })
        }
      },
      fail: err => {
      }
    })
    
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