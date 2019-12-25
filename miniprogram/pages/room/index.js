// pages/databaseGuide/databaseGuide.js

const app = getApp()

Page({

  data: {
    openid: '',
    result_array:[],
    id2userInfo:{},
    roomid:'',
    roomids:[],
    newroomids:[],
    roomid2openid:{},
    roomid2userInfo:{},
    roomid2record:{},
    inroom:false,
    textInputValue: '',
    roomid2unread_num:0
  },
  updateDataFromApp(){
    this.setData({
      roomid2record:app.globalData.roomid2record,
      roomid2userInfo:app.globalData.roomid2userInfo,
      roomid2unread_num:app.globalData.roomid2unread_num
    })
    setTimeout(this.updateDataFromApp,1000)
  },
  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
    this.updateDataFromApp()
  },
  onShow: function () {
    // 页面出现在前台时执行
    // 查询数据库找到对应房间id
    //this.onQuery()
    if(app.globalData.inroom){
      wx.hideTabBar()
      this.setData({
        roomid:app.globalData.roomid,
        inroom:true
      })
      this.scrollToBottom(true)
    }
  },
  //导航进聊天室
  toChat: function(event){
    const roomid = event.currentTarget.dataset.roomid
    wx.hideTabBar()
    this.setData({
      roomid:event.currentTarget.dataset.roomid,
      inroom:true
    })
    this.scrollToBottom(true)
    app.globalData.roomid2unread_num[roomid] = 0
    app.set_unread_reddot()
    //app.globalData.roomid = event.currentTarget.dataset.roomid
    //wx.navigateTo({
    //  url: '../chat/room',
    //})

  },
  leaveChat(){
    const roomid = this.data.roomid
    app.globalData.roomid2unread_num[roomid] = 0
    app.globalData.inroom = false
    wx.showTabBar()
    this.setData({
      inroom:false,
      roomid2unread_num:app.globalData.roomid2unread_num,
    })
    app.set_unread_reddot()
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
  },
  async onConfirmSendText(e) {
      if (!e.detail.value) {
        return
      }

      const db = wx.cloud.database()
      const _ = db.command

      const doc = {
        _id: `${Math.random()}_${Date.now()}`,
        groupId: this.data.roomid,
        avatar: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
        msgType: 'text',
        textContent: e.detail.value,
        sendTime: new Date(),
        sendTimeTS: Date.now(), // fallback
      }

      const roomid = this.data.roomid

      //存到全局数据和本地
      if(app.globalData.roomid2record[roomid]){
        app.globalData.roomid2record[roomid] = [
          ...app.globalData.roomid2record[roomid], 
          {
            ...doc,
            _openid: app.globalData.openid,
            writeStatus: 'pending',
          },
        ]
      }else
        app.globalData.roomid2record[roomid] = [{
          ...doc,
          _openid: app.globalData.openid,
          writeStatus: 'pending',
        }]
      
      wx.setStorageSync('roomid2record', app.globalData.roomid2record)
      //更新到视图层
      this.setData({
        textInputValue: '',
        roomid2record:app.globalData.roomid2record
      })
      //发送到数据库
      this.scrollToBottom(true)

      await db.collection('chatroom2').add({
        data: doc,
      })

      const roomrecord = 'roomid2record.'+roomid
      //上传完毕更新状态为written
      this.setData({
        [roomrecord]: this.data.roomid2record[roomid].map(chat => {
          if (chat._id === doc._id) {
            return {
              ...chat,
              writeStatus: 'written',
            }
          } else return chat
        }),
      })
      app.globalData.roomid2record[roomid] = this.data.roomid2record[roomid]
      wx.setStorageSync('roomid2record', app.globalData.roomid2record)

  },

  async onChooseImage(e) {
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: async res => {
        const doc = {
          _id: `${Math.random()}_${Date.now()}`,
          groupId: this.data.roomid,
          avatar: app.globalData.userInfo.avatarUrl,
          nickName: app.globalData.userInfo.nickName,
          msgType: 'image',
          sendTime: new Date(),
          sendTimeTS: Date.now(), // fallback
        }

        const roomid = this.data.roomid
        //存到全局变量和storage
        if(app.globalData.roomid2record[roomid]){
          app.globalData.roomid2record[roomid] = [
            ...app.globalData.roomid2record[roomid], 
            {
              ...doc,
              _openid: app.globalData.openid,
              tempFilePath: res.tempFilePaths[0],
              writeStatus: 0,
            },
          ]
        }else
          app.globalData.roomid2record[roomid] = [{
            ...doc,
            _openid: app.globalData.openid,
            tempFilePath: res.tempFilePaths[0],
            writeStatus: 0,
          }]
        
        
        wx.setStorageSync('roomid2record', app.globalData.roomid2record)
        
        //更新到视图层
        this.setData({
          textInputValue: '',
          roomid2record:app.globalData.roomid2record
        })
        this.scrollToBottom(true)

        
        const db = wx.cloud.database()
        const _ = db.command
        //发到数据库
        const uploadTask = wx.cloud.uploadFile({
          cloudPath: `${app.globalData.openid}/${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
          filePath: res.tempFilePaths[0],
          success: res => {
              db.collection('chatroom2').add({
                data: {
                  ...doc,
                  imgFileID: res.fileID,
                },
              })
              
              app.globalData.roomid2record[roomid] = app.globalData.roomid2record[roomid].map(
                chat => {
                  if (chat._id === doc._id) {
                    return {
                      ...chat,
                      writeStatus: 100,
                      tempFilePath: res.fileID
                    }
                  } else return chat
                })

              wx.setStorageSync('roomid2record', app.globalData.roomid2record)
          
          },
          fail: e => {
            this.showError('发送图片失败', e)
          },
        })


        const roomrecord = 'roomid2record.'+roomid

        uploadTask.onProgressUpdate(({ progress }) => {
          this.setData({
            [roomrecord]: this.data.roomid2record[roomid].map(chat => {
              if (chat._id === doc._id) {
                return {
                  ...chat,
                  writeStatus: progress,
                }
              } else return chat
            })
          })
        })
      },
    })
  },

  onMessageImageTap(e) {
    wx.previewImage({
      urls: [e.target.dataset.fileid],
    })
  },
  scrollToBottom(force) {
    if (force) {
      console.log('force scroll to bottom')
      this.setData({
        scrollTop: 100000,
        scrollWithAnimation: true,
      })
      return
    }

    this.createSelectorQuery().select('.body').boundingClientRect(bodyRect => {
      this.createSelectorQuery().select(`.body`).scrollOffset(scroll => {
        if (scroll.scrollTop + bodyRect.height * 3 > scroll.scrollHeight) {
          console.log('should scroll to bottom')
          this.setData({
            scrollTop: 100000,
            scrollWithAnimation: true,
          })
        }
      }).exec()
    }).exec()
  }

})