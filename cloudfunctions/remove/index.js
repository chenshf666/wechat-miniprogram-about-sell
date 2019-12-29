// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  item_id = event.item_id
  return db.collection('square').where({
    _id: item_id}
  ).remove()
}