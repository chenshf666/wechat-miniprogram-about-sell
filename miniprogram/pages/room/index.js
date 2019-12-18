// pages/databaseGuide/databaseGuide.js

const app = getApp()

Page({

  data: {
    openid: '',
    result_array:[],
    id2userInfo:{}
  },
  onLoad: function (options) {
    this.test()
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
  },
  test(){
    const db = wx.cloud.database()
    const _ = db.command
    const watcher = db.collection('openid2groupid').where(_.or([
      {
        _openid: app.globalData.openid,
      },
      {
        another_openid: app.globalData.openid,
      }
    ])).watch({
      onChange: function(snapshot) {
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })

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
        this.GetOthersUserInfo()
      },
      fail: err => {
      }
    })
  },
  //获取聊天对象的头像和昵称
  GetOthersUserInfo: function(){
    const db = wx.cloud.database()
    for(var i = 0; i < this.data.result_array.length; i++){
      let _index = i 
      let _openid = this.data.result_array[_index]._openid
      if(app.globalData.openid == _openid){
        _openid = this.data.result_array[_index].another_openid
      }
      let tmp = 'id2userInfo.'+this.data.result_array[_index]._id
      db.collection('openid2userInfo').where({
        _openid : _openid
      }).get({
        success: res => {
          this.setData({[tmp]:res.data[0]})
        },
        fail: res=>{
          console.log(res)
        }
      })
    }
    
  },
  onPullDownRefresh: function () {
    　　　wx.showNavigationBarLoading() //在标题栏中显示加载
    　　　　//模拟加载  1秒
    　　　　setTimeout(function () {
              // complete
      　　　　wx.hideNavigationBarLoading() //完成停止加载
      　　　　wx.stopPullDownRefresh() //停止下拉刷新
              },
            500);
            this.onQuery()
  }

})