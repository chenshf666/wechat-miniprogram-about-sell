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
    filePaths:'',
    files: [{
      url: 'http://mmbiz.qpic.cn/mmbiz_png/VUIF3v9blLsicfV8ysC76e9fZzWgy8YJ2bQO58p43Lib8ncGXmuyibLY7O3hia8sWv25KCibQb7MbJW3Q7xibNzfRN7A/0',
  }, {
      loading: true
  }, {
      error: true
  }]
  },
  onLoad :function(){
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
  })
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
      count: 9,
      sourceType: ['album', 'camera'],
      success: function (res) {
        const filePath = res.tempFilePaths[0]
        console.log(res.tempFilePaths)
        thisFile.setData({
          imageChoose:true,
          imageUrl:filePath,
          filePaths:res.tempFilePaths
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
    let thisFile = this
    const filePath = this.data.imageUrl
    // 上传图片
    wx.showLoading({
      title: '上传中',
    })
    const cloudPath = 'square/' + Date.now() + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        thisFile.onAdd(this.data.input_value,this.data.input_value2,res.fileID,app.globalData.userInfo)
        app.globalData.fileID = res.fileID
        app.globalData.cloudPath = cloudPath
        app.globalData.imagePath = filePath
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
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
    chooseImage: function (e) {
        var that = this;
        wx.chooseImage({
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                that.setData({
                    files: that.data.files.concat(res.tempFilePaths)
                });
            }
        })
    },
    previewImage: function(e){
        wx.previewImage({
            current: e.currentTarget.id, // 当前显示图片的http链接
            urls: this.data.files // 需要预览的图片http链接列表
        })
    },
    selectFile(files) {
        console.log('files', files)
        // 返回false可以阻止某次文件上传
    },
    uplaodFile(files) {
        console.log('upload files', files)
        // 文件上传的函数，返回一个promise
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject('some error')
            }, 1000)
        })
    },
    uploadError(e) {
        console.log('upload error', e.detail)
    },
    uploadSuccess(e) {
        console.log('upload success', e.detail)
    }

})
