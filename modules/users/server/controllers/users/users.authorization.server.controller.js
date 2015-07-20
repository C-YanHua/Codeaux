'use strict';

// Module dependencies.
var mongoose = require('mongoose');

var User = mongoose.model('User');

// View user profile by username middleware.
exports.userByUsername = function(req, res, next, username) {
  User.findOne({username: username}).exec(function(err, user) {
    if (err || !user) {
      return res.status(404).send({
        message: 'Username is invalid'
      });
    }

    req.profile = user;
    next();
  });
};
