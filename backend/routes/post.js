const express = require('express');
const router = express.Router();
const Post = require('./../models/post');
const checkAuth = require('../middleware/check-auth');
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
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, `${name}-${Date.now()}.${ext}`);
  }
});

router.get('', (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count()
    })
    .then(count => {
      res.status(200).json({
        message: 'Successfully',
        posts: fetchedPosts,
        totalPosts: count
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

router.post(
  '', 
  checkAuth, 
  multer({ storage: storage }).single("image"), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: `${url}/images/${req.file.filename}`
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post: {
          id: createdPost._id,
          title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath
        }
      });
    });
  }
);

router.put(
  '/:id', 
  checkAuth,
  multer({ storage: storage }).single("image"), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = `${url}/images/${req.file.filename}`;
  }
  const id = req.params.id;
  const post = new Post({
    _id: id,
    title: req.body.title,
    content: req.body.content,
    imagePath
  });
  Post.updateOne({ _id: id }, post)
    .then(post => {
      res.status(200).json({
        message: 'Post was been updated',
        post
      })
    });
});

router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({_id: req.params.id})
    .then(post => {
      res.status(202).json({
        message: 'Post was been deleted'
      });
    })
});

module.exports = router;
