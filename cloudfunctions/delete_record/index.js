const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    return await db.collection('chatroom2').where({
      groupId:event.roomid,
      _openid:_.neq(event.openid)
    }).remove()
  } catch(e) {
    console.error(e)
  }
}