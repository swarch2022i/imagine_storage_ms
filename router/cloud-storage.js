const path = require('path')
const ShortUniqueId = require('short-unique-id')
const uid = new ShortUniqueId({ length: 6 });
var multer = require("multer");
var express = require('express');
var router = express.Router();

var { start, queue } = require('../utils/rabbit-client')


let rabbitConnection, rabbitChannel;
//Initialize RabbitMQ
start().then(({ connection, channel }) => {
  rabbitConnection = connection
  rabbitChannel = channel
})

var uploadHandler = multer({
  storage: multer.memoryStorage()
});

var { gc, bucket } = require('../utils/cloud-context');
const { json } = require('express');
const { channel } = require('diagnostics_channel');


//mientras el careverga de nicolas hace su funcion para subir varias imagenes al tiempo
// router.post('/upload', uploadHandler.single('images'), async function(req, res) {
router.post('/upload', uploadHandler.array('images', 1), async function(req, res) {
  if (!req.body.userId) return;
  let files = []
  let done = {
    state: false,
    msg: {
      ownerId: req.body.userId,
      name: req.body.name || "",
      description: req.body.description || "",
      tags: req.body.tags || [],
      commentsId: req.body.commentsId || [],
      imageStorageId: "",
      url: ""
    }
  };
  let response = {
    state: false,
    msg: "",
  }
  if (req.files.length === 0) {
    files = JSON.parse(req.body.images)
    if (files.length === 0) {
      return;
    }
    response = await handleUploadImages(files, req.body.userId, req.body.albumId, true)
  } else {
    response = await handleUploadImages(req.files, req.body.userId, req.body.albumId, false)
  }

  if (done) {
    done.state = response.state;
    done.msg.imageStorageId = response.msg[0].id;
    done.msg.url = response.msg[0].url;
    const sent = await rabbitChannel.sendToQueue(
      queue,
      // Buffer.from('nicolas'))
      Buffer.from(JSON.stringify(done)))

    if (sent) {
      console.log(`Sent message to "${queue}" queue`, done)
    } else {
      console.log(`Fails sending message to "${queue}" queue`, done)
    }
    res.status(200)
      .json({
        msg: 'successful upload',
        body: done
          // urls: done.msg
      });
  } else {
    res.status(400)
      .json({
        msg: 'Error',
        error: done.msg,
      });
  }
});

router.delete('/:id', async(req, res) => {
  if (!req.params.id) return;

  let files = await bucket.getFiles();
  const image = files[0].filter(f => f.id.includes(`${req.params.id}`))

  let response = await image[0].delete()
  if (response[0].statusCode == 204) {
    res.status(200)
      .json({ name: 'Deleted image', msg: image[0].name })
  } else {
    res.status(400)
      .json({ name: 'Error', msg: response.statusMessage })
  }

  // image[0].delete().then(response => {
  //   res.status(200)
  //     .json({ msg: 'Deleted image', name: image[0].name })
  // }).catch(err => {
  //   res.status(400)
  //     .json({ msg: 'Error', error: err })
  // })
})

router.get('/:id', async(req, res) => {
  console.log('hola')
  if (!req.params.id) return;

  let files = await bucket.getFiles();
  const image = files[0].filter(f => f.id.includes(`${req.params.id}`))

  let result = {}
  if (image) {
    result = { url: `${process.env.GCS_ENDPOINT}${process.env.GCS_BUCKET}/${image[0].name}` }
    console.log(result)
    res.status(200)
      .json(result)
  } else {
    result = { msg: 'Error', error: 'Not found' }
    res.status(400)
      .json(result)
  }
})

router.get('/', async(req, res) => {
  console.log('hola2')

  let files = await bucket.getFiles();
  const result = []

  files[0].forEach(file => {
    result.push({ url: `${process.env.GCS_ENDPOINT}${process.env.GCS_BUCKET}/${file.name}` })
  });


  res.status(200).json(result)

  // if (image) {
  //   res.status(200)
  //     .json({ url: `${process.env.GCS_ENDPOINT}${process.env.GCS_BUCKET}/${image[0].name}` })
  // } else {
  //   res.status(400)
  //     .json({ msg: 'Error', error: 'Not found' })
  // }
})


async function handleUploadImages(files, userId, albumId = undefined, variation) {
  let promises = []
  for (let i = 0; i < files.length; i++) {
    const image = files[i];
    let id = uid();
    let name = id
    promises.push(
      new Promise((resolve, reject) => {
        if (!albumId) {
          name = `${userId}/${id}${path.extname(image.originalname)}`
        } else {
          name = `${userId}/${albumId}/${id}${path.extname(image.originalname)}`
        }
        let blob = bucket.file(name)

        let buffer = image.buffer
        if (variation) {
          buffer = Buffer.from(image.buffer.data)
        }

        console.log(buffer)
        blob.save(buffer, (err) => {
          if (!err) {
            // console.log('cool');
            const publicUrl = `${process.env.GCS_ENDPOINT}${process.env.GCS_BUCKET}/${blob.name}`
              // console.log(encodeURI(publicUrl))
            resolve({ id: id, url: publicUrl })
          } else {
            console.log("error " + err);
            reject(err)
          }
        })
      })
    )
  }

  let results = await Promise.all(promises)

  if (results) {
    console.log(results)
    return { state: true, msg: results }
  } else {
    return { state: false, msg: 'error' }
  }
  // let results = await Promise.all(promises).then(results => {
  //   console.log(results)
  //   return { state: true, msg: results }
  // }).catch(err => {
  //   return { state: false, msg: err }
  // })
}

module.exports = router;