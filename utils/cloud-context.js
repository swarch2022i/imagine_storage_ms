const path = require('path')
const { Storage } = require('@google-cloud/storage')

const gc = new Storage({
  keyFilename: path.join(path.resolve("./"), `${process.env.GCS_FILE}`),
  projectId: `${process.env.GCS_PROJECT_ID}`
})

// gc.getBuckets().then((x) => {
//   console.log(x)
// })

const bucket = gc.bucket(`${process.env.GCS_BUCKET}`);

module.exports = { gc, bucket };