const path = require('path')
const ShortUniqueId = require('short-unique-id')
const uid = new ShortUniqueId({ length: 6 });
var multer = require("multer");
var express = require('express');
var router = express.Router();

var uploadHandler = multer({
  storage: multer.memoryStorage()
});

var { gc, bucket } = require('../utils/cloud-context')


router.post('/upload', uploadHandler.array('images'), function(req, res) {

  if (!req.files) return;
  if (!req.body.userId) return;

  let promises = []
  for (let i = 0; i < req.files.length; i++) {
    const image = req.files[i];
    let id = uid();
    let name = id
    promises.push(
      new Promise((resolve, reject) => {
        if (!req.body.albumId) {
          name = `${req.body.userId}/${id}${path.extname(image.originalname)}`
        } else {
          name = `${req.body.userId}/${req.body.albumId}/${id}${path.extname(image.originalname)}`
        }
        let blob = bucket.file(name)

        blob.save(image.buffer, (err) => {
          if (!err) {
            console.log('cool');
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

  Promise.all(promises).then(results => {
    console.log(results)
    res.status(200)
      .json({
        msg: 'successful upload',
        urls: results
      });
  }).catch(err => {
    res.status(400)
      .json({
        msg: 'Error',
        error: err,
      });
  })
});

router.delete('/:id', async(req, res) => {
  if (!req.params.id) return;

  let files = await bucket.getFiles();
  const image = files[0].filter(f => f.id.includes(`${req.params.id}`))

  if (response.statusCode == 204) {
    res.status(response.statusCode)
      .json({ msg: 'Deleted image', name: image[0].name })
  } else {
    res.status(400)
      .json({ msg: 'Error', error: response.statusMessage })
  }

  // image[0].delete().then(response => {
  //   res.status(response.statusCode)
  //     .json({ msg: 'Deleted image', name: image[0].name })
  // }).catch(err => {
  //   res.status(400)
  //     .json({ msg: 'Error', error: err })
  // })
})

router.get('/:id', async(req, res) => {
  if (!req.params.id) return;

  let files = await bucket.getFiles();
  const image = files[0].filter(f => f.id.includes(`${req.params.id}`))

  if (image) {
    res.status(200)
      .json({ url: `${process.env.GCS_ENDPOINT}${process.env.GCS_BUCKET}/${image[0].name}` })
  } else {
    res.status(400)
      .json({ msg: 'Error', error: 'Not found' })
  }
})

module.exports = router;