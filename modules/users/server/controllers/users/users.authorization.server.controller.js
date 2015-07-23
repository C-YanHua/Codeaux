'use strict';

// Module dependencies.
var mongoose = require('mongoose');

var User = mongoose.model('User');

/*
 * Find user by username middleware.
 * Redirects to route not found if username does not exists.
 */
exports.userByUsername = function(req, res, next, username) {
  User.findOne({username: username}, 'name username email profileImageUrl').exec(function(err, user) {
    if (err || !user) {
      return res.redirect('/404-page-not-found');
    }

    req.profile = user;
    next();
  });
};
