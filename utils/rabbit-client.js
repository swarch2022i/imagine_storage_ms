'use strict'

const amqp = require('amqplib')
const queue = process.env.QUEUE || 'hello'

function start() {
  let promise = new Promise(async(resolve, reject) => {
    let connection = await amqp.connect('amqp://34.125.254.72')
    let channel = await connection.createChannel()

    channel.assertQueue(queue).then(() => {
        // console.log('holi', channel)
        resolve({ connection, channel })
      }).catch(err => {
        reject()
      })
      // return { connection, channel }
  })
  return promise
}

module.exports = {
  start,
  queue
};