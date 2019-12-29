// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  item_id = event.item_id
  info = event.info
  info2 = event.info2
  return db.collection('square').where({
    _id: item_id}
  ).update({
    data: {
      info:info,
      info2:info2,
    }
  })
}