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
    db.collection('square').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        console.log(res.data)
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
  },
  onRemove: function (event) {
    let thisFile = this
    console.log(event.currentTarget.dataset.id)
    const db = wx.cloud.database()
    db.collection('square').doc(
      event.currentTarget.dataset.id
    ).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          this.onDeleteFile(event.currentTarget.dataset.fileid)
          this.onQuery()
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
          console.error('[数据库] [删除记录] 失败：', err)
        }
      })
  },
  onDeleteFile: function(fileid){
    wx.cloud.deleteFile({
      fileList: [fileid],
      success: res => {
        // handle success
        console.log(res.fileList)
      },
      fail: err => {
        // handle error
      },
      complete: res => {
        // ...
      }
    })
  }

})