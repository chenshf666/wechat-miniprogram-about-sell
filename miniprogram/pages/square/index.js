// pages/databaseGuide/databaseGuide.js

const app = getApp()

Page({
  data: {
    openid: '',
    queryResult: '',
    result_array:[],
    item_nums : 0
  },

  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
    this.onQuery()
  },

  onReachBottom: function () {
    const db = wx.cloud.database()
    wx.showLoading({
      title: '刷新中！',
      duration: 1000
    })
    
    let x = this.data.item_nums + 20
    console.log(x)
    let old_data = this.data.result_array
    db.collection('square').skip(x) // 限制返回数量为 20 条
      .get({
        success: res => {
          this.setData({
            result_array: old_data.concat(res.data),
            item_nums : x,
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


  doSearch: function (e) {
    const db = wx.cloud.database()
    db.collection('square').where({     //实现模糊查询
      info:{
        $regex: '.*' + e + '.*',
        $options: 'i'
      }
    }).get({
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
  },

  inputSearch: function (e) {
    this.doSearch(e.detail.value)
  },

  onImageTap(e) {
    wx.previewImage({
      urls: [e.target.dataset.fileid],
    })
  },
  todetail:function(event){
    app.globalData.picccc = event.currentTarget.dataset.url;
    app.globalData.input1111 = event.currentTarget.dataset.info;
    app.globalData.input2222 = event.currentTarget.dataset.info2;
    wx.navigateTo({
      url: '../detail/detail',
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
          result_array:res.data.reverse(),
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
  onPullDownRefresh: function () {
    　　　wx.showNavigationBarLoading() //在标题栏中显示加载
    　　　　//模拟加载  1秒
    　　　　setTimeout(function () {
      // complete
      　　　　wx.hideNavigationBarLoading() //完成停止加载
      　　　　wx.stopPullDownRefresh() //停止下拉刷新
    },
      1000);
      this.onQuery()
  },
})