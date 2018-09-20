const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(result => {
          res.status(201).json({
            result,
            message: 'User created'
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          })
        })
    })
});

router.post('/login', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user)
        return res.status(401).json({
          message: 'Auth is failed'
        });
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password)
      })
      .then(result => {
        if (!result)
          return res.status(401).json({
            message: 'Auth is failed'
          });
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id }, 
          'secret_shold_be_long', 
          { expiresIn: '1h' }
        );
        res.status(200).json({ 
          token,
          expiresIn: 3600
         });
      })
      .catch(err => {
        return res.status(401).json({
          message: 'Auth is failed'
        })
      })
});
      

module.exports = router;

