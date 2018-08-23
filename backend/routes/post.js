const express = require('express');
const router = express.Router();
const Post = require('./../models/post');
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images')
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${name}-${Date.now()}.${ext}`);
  }
})

router.get('', (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({
        message: 'Successfully',
        posts
      });
    })
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id)
    .then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({
          message: 'Post is not found'
        })
      };
    });
});

router.post('', multer(storage).single('image'), (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content
  });
  post.save()
    .then(post => {
      res.status(201).json({
        message: 'Post added successfully',
        post
      })
    });
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const post = new Post({
    _id: id,
    title: req.body.title,
    content: req.body.content
  });
  Post.updateOne({ _id: id }, post)
    .then(post => {
      res.status(200).json({
        message: 'Post was been updated',
        post
      })
    });
});

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
    .then(post => {
      res.status(202).json({
        message: 'Post was been deleted'
      });
    })
});

module.exports = router;
