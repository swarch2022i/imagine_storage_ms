'use strict'

const amqp = require('amqplib')
const queue = process.env.QUEUE || 'hello'

function start() {
  let promise = new Promise(async(resolve, reject) => {
    try {
      let connection = await amqp.connect(`amqp://${process.env.RABBITMQ_HOST}`)
      let channel = await connection.createChannel()

      channel.assertQueue(queue).then(() => {
          // console.log('holi', channel)
          resolve({ connection, channel })
        }).catch(err => {
          reject(err)
        })
        // return { connection, channel }
    } catch (error) {
      reject(error)
    }

  })
  return promise
}

// start().then(() => {
//   console.log('funciono')
// })

module.exports = {
  start,
  queue
};