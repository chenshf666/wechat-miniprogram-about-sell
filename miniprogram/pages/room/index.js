// pages/databaseGuide/databaseGuide.js

const app = getApp()

Page({

  data: {
    openid: '',
    result_array:[]
  },
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
  },
  onShow: function () {
    // 页面出现在前台时执行
    // 查询数据库找到对应房间id
    this.onQuery()
  },
  //导航进聊天室
  toChat: function(event){
    app.globalData.roomid = event.currentTarget.dataset.roomid
    wx.navigateTo({
      url: '../chat/room',
    })
  },
  //查询数据库集合openid2groupid里有没有关于房间id的记录，有的话说明已经存在和本人相关对话
  onQuery: function () {
    const db = wx.cloud.database()
    const _ = db.command
    db.collection('openid2groupid').where(_.or([
      {
        _openid: app.globalData.openid,
      },
      {
        another_openid: app.globalData.openid,
      }
    ])).get({
      success: res => {
        this.setData({
          result_array: res.data
        })
      },
      fail: err => {
      }
    })
  }

})