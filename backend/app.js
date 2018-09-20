const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb://localhost/node-angular')
  .then(_ => console.log('Connected'))
  .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE'
  )
  next();
});

app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes)

module.exports = app;
