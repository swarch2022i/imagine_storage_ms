require('dotenv').config()
var express = require("express");
var cors = require('cors')
var cloudStorage = require('./router/cloud-storage');

var app = express();

app.use(cors())

app.use('/api/storage', cloudStorage);

app.get('/', function(req, res) {
  res.send('Hello World')
})

app.listen(1234)