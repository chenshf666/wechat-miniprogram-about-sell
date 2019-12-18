//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    input_value:'主题',
    input_value2:'内容',
    imageChoose: false,
    imageUrl:'',
    filePaths:[],//'选择的图片列表',
    max_count: 9
  },
  test: function(){
    console.log(this.data.input_value)
  },
  updateInputValue:function(res){
    this.setData({
      input_value:res.detail.value
    })
  },
  updateInputValue2: function (res) {
    this.setData({
      input_value2: res.detail.value
    })
  },
  doChoose: function(){
    let thisFile = this
    wx.chooseImage({
      count: this.data.max_count,
      sourceType: ['album', 'camera'],
      success: function (res) {
        const filePath = res.tempFilePaths[0]
        console.log(res.tempFilePaths)
        thisFile.setData({
          imageChoose:true,
          imageUrl:filePath,
          filePaths:[...(thisFile.data.filePaths),...(res.tempFilePaths)]
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  doSend: function(){
    if(!app.globalData.logged){
      wx.showToast({
        icon: 'none',
        title: '你妈的先登录'
      })
      return
    }
    if(this.data.input_value.length <= 3 || !this.data.imageUrl){
      wx.showToast({
        icon: 'none',
        title: '龟龟哟，先输入4个以上字符和选择图片行不'
      })
      return
    }

    // 上传图片
    wx.showLoading({
      title: '上传中',
    })
    let thisFile = this
    let sucess_count = 0
    const files_num = this.data.filePaths.length
    for(var i = 0; i < files_num; i++){
      const filePath = this.data.filePaths[i]
      const cloudPath = 'square/' + Date.now() + app.globalData.openid 
                          + i + filePath.match(/\.[^.]+?$/)[0]
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => { ++sucess_count },
        complete: () => {
          if(sucess_count == files_num){
            thisFile.onAdd(this.data.input_value,
                           this.data.input_value2,
                           this.data.filePaths,
                           app.globalData.userInfo)
          }
          wx.hideLoading()
        }
      })
    }
    
  },
  onAdd: function (info,info2, url, userInfo) {
    console.log(Date.now())
    const db = wx.cloud.database()
    db.collection('square').add({
      data: {
        info:info,
        info2:info2,
        url: url,
        nick:userInfo.nickName,
        head: userInfo.avatarUrl
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1
        })
        wx.showToast({
          title: '新增记录成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  previewImage: function previewImage(e) {
    var index = e.currentTarget.dataset.index;

    this.setData({
        previewCurrent: index,
        showPreview: true
    });
  },
  deletePic : function(e){
    var index = e.detail.index;
    var files = this.data.filePaths;
    var file = files.splice(index, 1);
    this.setData({
        filePaths: files
    })
  }
})
