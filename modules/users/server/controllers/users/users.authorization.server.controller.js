'use strict';

// Module dependencies.
var mongoose = require('mongoose');

var User = mongoose.model('User');

// View user profile by username middleware.
exports.userByUsername = function(req, res, next, username) {
  User.findOne({username: username}).exec(function(err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(new Error('Failed to load User ' + username));
    }

    req.profile = user;
    next();
  });
};
