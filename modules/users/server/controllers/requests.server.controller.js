'use strict';

// Module dependencies.
var _ = require('lodash');
var mongoose = require('mongoose');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var Request = mongoose.model('FriendRequest');

/**
 * List of Users.
 */
exports.listForUser = function(req, res) {
  Request.find({receiver: req.query.receiverID, status: 'pending'})
  .sort('-created')
  .populate('requester', 'username name imageUrl')
  .exec(function(err, requests) {

    if (err) {
      return res.status(400).send(errorHandler.getErrorResponse(2));
    } else {
      res.jsonp(requests);
    }
  });
};

exports.create = function(req, res) {
  var request = new Request(req.body);
  request.save(function(err) {
    if (err) {
      return res.status(400).send(errorHandler.getErrorResponse(2));
    } else {
      res.json(request);
    }
  });
};

exports.update = function(req, res) {
  var request = req.request;
  request = _.extend(request, req.body);

  request.save(function(err) {
    if (err) {
      return res.status(400).send(errorHandler.getErrorResponse(2));
    } else {
      res.jsonp(request);
    }
  });
};

exports.requestById = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send({
      message: 'Issues is invalid'
    });
  }

  Request.findById(id).exec(function(err, request) {
    if (err) {
      return next(err);
    }

    if (!request) {
      return next(new Error('Failed to load Request ' + id));
    }

    req.request = request;
    next();
  });
};
