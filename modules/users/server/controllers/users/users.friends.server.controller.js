'use strict';

// Module dependencies.
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var path = require('path');
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var User = mongoose.model('User');

/**
 * List of Users.
 */
exports.search = function(req, res) {
  User.find({username: new RegExp(req.query.username, "i")}).sort('-created').exec(function(err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(users);
    }
  });
};
