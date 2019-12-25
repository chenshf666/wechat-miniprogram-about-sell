//index.js
const app = getApp()
var util = require('../../utils/util.js');

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    input_value:'主题',
    input_value2:'',
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

  bindTextAreaBlur: function (e) {
    var that = this;
    that.setData({
      input_value2: e.detail.value
    });
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
  async doSend(){
    if(!app.globalData.logged){
      wx.showToast({
        icon: 'none',
        title: '请先登录'
      })
      return
    }
    if(this.data.input_value.length <= 3 || this.data.filePaths.length < 1){
      wx.showToast({
        icon: 'none',
        title: '请先输入4个以上字符和选择图片'
      })
      return
    }

    // 上传图片
    wx.showLoading({
      title: '上传中',
    })
    let thisFile = this
    let cloudfilePaths = []
    let sucess_count = 0
    const files_num = this.data.filePaths.length
    for(var i = 0; i < files_num; i++){
      const filePath = this.data.filePaths[i]
      const cloudPath = 'square/' + Date.now() + app.globalData.openid 
                          + i + filePath.match(/\.[^.]+?$/)[0]
      const res = await wx.cloud.uploadFile({cloudPath,filePath})
      cloudfilePaths = [...cloudfilePaths,res.fileID]
    }
    this.onAdd(this.data.input_value,
      this.data.input_value2,
      cloudfilePaths,
      app.globalData.userInfo)
  },
  onAdd: function (info,info2, url, userInfo) {
    console.log(Date.now())
    const db = wx.cloud.database()
    var time = util.formatTime(new Date());
    db.collection('square').add({
      data: {
        info:info,
        info2:info2,
        url: url,
        nick:userInfo.nickName,
        head: userInfo.avatarUrl,
        time: time
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
  },
  hideGallery(){
    this.setData({
      showPreview: false
  });
  }
})
