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
    db.collection('openid2groupid').where(_.or([
      {
      _openid:target_openid,
      another_openid:app.globalData.openid
      },
      {
        _openid: app.globalData.openid,
        another_openid: target_openid
      }
    ])).get({
      success: res => {
        result = res.data
        console.log(res.data)
        if (result.length < 1) {
          //如果没有创建则创建记录，roomid为两个openid相加
          db.collection('openid2groupid').add({
            data: {
              another_openid: target_openid
            },
            success: res => {
              console.log(res._id)
              app.globalData.roomid = res._id
              wx.navigateTo({
                url: '../chat/room',
              })
            },
            fail: err => {
            }
          })
        } else {
            app.globalData.roomid = result[0]._id
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