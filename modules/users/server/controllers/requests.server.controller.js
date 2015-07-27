'use strict';

// Module dependencies.
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var path = require('path');
var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var Request = mongoose.model('FriendRequest');

/**
 * List of Users.
 */
exports.listForUser = function(req, res) {
  /*
  */
};

exports.create = function(req, res) {
  var request = new Request(req.body);
  request.save(function(err) {
    if (err) {
      return res.status(400).send({message: errorHandler.getErrorMessage(err)});
    } else {
      res.json(request);
    }
  });
};
