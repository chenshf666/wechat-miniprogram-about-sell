const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
    title: '',
    content: '',
    filePaths: [],
    rfilePaths: [],
    head:'',
    nick:'',
    openid:'',
    text1:'111',//自己，编辑，别人，联系
    text2:'22'//自己，删除，别人，收藏
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      filePaths : app.globalData.picccc,
      rfilePaths: app.globalData.picccc,
      title: app.globalData.input1111,
      content: app.globalData.input2222,
      head: app.globalData.headddd,
      nick: app.globalData.nickkkk,
      openid: app.globalData.openidddd
    })
    const files_num = this.data.filePaths.length
    for (var i = 0; i < files_num; i++) {
      this.data.rfilePaths[i] = this.data.filePaths[files_num - i - 1]
    }
  },
  initialize: function() {
    const files_num = this.data.filePaths.length
    for (var i = 0; i < files_num; i++) {
      this.data.rfilePaths[i]=this.data.filePaths[files_num-i-1]
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  previewImage: function previewImage(e) {
    var index = e.currentTarget.dataset.index;

    this.setData({
      previewCurrent: index,
      showPreview: true
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },
  test: function (event) {
    const target_openid = this.data.openid
    if (target_openid == app.globalData.openid) {
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
        _openid: target_openid,
        another_openid: app.globalData.openid
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
              app.globalData.inroom = true
              wx.switchTab({
                url: '../room/index'
              })
            },
            fail: err => {
            }
          })
        } else {
          app.globalData.roomid = result[0]._id
          app.globalData.inroom = true
          wx.switchTab({
            url: '../room/index'
          })
        }
      },
      fail: err => {
      }
    })

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  onImageTap(e) {
    wx.previewImage({
      urls: [e.target.dataset.fileid],
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})