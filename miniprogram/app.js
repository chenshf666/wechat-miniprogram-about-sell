//app.js
App({
  test(){
    const db = wx.cloud.database()
    const _ = db.command
    const that = this
    const watcher = db.collection('openid2groupid').where(_.or([
      {
        _openid: this.globalData.openid,
      },
      {
        another_openid: this.globalData.openid,
      }
    ])).watch({
      onChange: function(snapshot) {
        console.log('snapshot', snapshot)
        that.save_roomids_and_roomid2openid_and_roomid2userInfo(snapshot.docs).then(
          function(){that.listener_according_to_newroomids()}
        )
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })

  },
  async save_roomids_and_roomid2openid_and_roomid2userInfo(docs){
    console.log(docs)
    let roomids = []
    let newroomids = []
    let roomid2openid = {}
    let roomid2userInfo = {}
    const db = wx.cloud.database()
    for(var i = 0; i < docs.length; i++){
      if(!this.globalData.roomids.includes(docs[i]._id)){
        newroomids = [...newroomids, docs[i]._id]}

      roomids = [...roomids, docs[i]._id]

      if(docs[i]._openid == this.globalData.openid){
        roomid2openid[docs[i]._id] = docs[i].another_openid
      }else{
        roomid2openid[docs[i]._id] = docs[i]._openid
      }

      const res = await db.collection('openid2userInfo').where({
        _openid : roomid2openid[docs[i]._id]
      }).get()
      roomid2userInfo[docs[i]._id] = {'nickName':res.data[0].nickName, 'head':res.data[0].head}
    }

    this.globalData.roomids = roomids
    this.globalData.newroomids = newroomids
    this.globalData.roomid2openid = roomid2openid
    this.globalData.roomid2userInfo = roomid2userInfo

    wx.setStorage({
      key:"roomids",
      data:roomids
    })

    wx.setStorage({
      key:"roomid2openid",
      data:roomid2openid
    })

    wx.setStorage({
      key:"roomid2userInfo",
      data:roomid2userInfo
    })
    
  },
  // 根据roomid查询聊天记录，如果存在不是自己发的聊天记录，就会触发onchange
  listener_according_to_newroomids(){
    const db = wx.cloud.database()
    const _ = db.command
    let newroomids = this.globalData.newroomids
    console.log(newroomids.length)
    for(var i = 0; i < newroomids.length; i++){
      console.log('<<listener_according_to_newroomids>>')
      const watcher = db.collection('chatroom2').where(_.and([{
        groupId:newroomids[i]
      },{
        _openid: _.neq(this.globalData.openid)
      }])).watch({
        onChange: this.deal_with_onchange.bind(this),
        onError: function(err) {
          console.error('the watch closed because of error', err)
        }
      })
    }
  },
  deal_with_onchange(snapshot){
    console.log(snapshot)
    for (const docChange of snapshot.docChanges) {
      if (docChange.dataType != 'remove'){
          console.log('doc in <<listener_according_to_newroomids>>', docChange.doc)
          const roomid = docChange.doc.groupId
          this.globalData.roomid2unread_num[roomid] = 1+(this.globalData.roomid2unread_num[roomid] || 0)
          this.set_unread_reddot()
          this.set_to_ram(roomid,docChange.doc)
          this.delete_over_read_record(roomid)
          }
    }
  },
  set_to_ram(roomid,doc){
    if(this.globalData.roomid2record[roomid]){
      console.log('in set_to_ram',this.globalData.roomid2record[roomid],doc)
      this.globalData.roomid2record[roomid] = [...this.globalData.roomid2record[roomid], doc]
    }else
      this.globalData.roomid2record[roomid] = [doc]
    wx.setStorageSync('roomid2record', this.globalData.roomid2record)
  },
  delete_over_read_record(roomid){
    wx.cloud.callFunction({
      // 云函数名称
      name: 'delete_record',
      // 传给云函数的参数
      data: {
        roomid: roomid,
        openid: this.globalData.openid,
      },
    })
    .then(res => {
      console.log(res.result) // 3
    })
    .catch(console.error)
    
  },
  set_unread_reddot(){
    var count = 0
    for(const key in this.globalData.roomid2unread_num){
      count += this.globalData.roomid2unread_num[key]
    }
    if (count > 0)
      wx.setTabBarBadge({
        index: 2,
        text: String(count)
      })
      else
        wx.removeTabBarBadge({
          index: 2
        })
    
    wx.setStorageSync('roomid2unread_num', this.globalData.roomid2unread_num)
  },
  async onGetOpenid () {
    // 调用云函数
    
    const res = await wx.cloud.callFunction({
      name: 'login',
      data: {}
    })

    console.log('[云函数] [login] user openid: ', res.result.openid)
    this.globalData.openid = res.result.openid
  },
  onLaunch: function () {
    let that = this

    this.globalData = {
      logged:false, //于person页面更新，表示用户是否已经同意授予头像和昵称
      userInfo: '',  //于person页面更新，用户同意授予头像和昵称后，得到这个对象，userInfo.avatarUrl是头像链接，nickName是昵称
      picccc: '',
      input1111: '',
      input2222: '',
      roomids : [],
      newroomids : [],
      roomid2openid : {},
      roomid2userInfo : {},
      roomid2record:wx.getStorageSync('roomid2record')||{},
      roomid2unread_num: wx.getStorageSync('roomid2unread_num')||{},
      unreadnum:0
    }
    this.set_unread_reddot()

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
      this.onGetOpenid().then(
        function(){ that.test()}
      )
      }
  }
})
