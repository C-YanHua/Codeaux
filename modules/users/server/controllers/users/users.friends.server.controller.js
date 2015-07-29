'use strict';

// Module dependencies.
var mongoose = require('mongoose');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var User = mongoose.model('User');

/*
 * List of Users.
 */
exports.search = function(req, res) {
  User.find({username: new RegExp(req.query.username, 'i')}).sort('-created').exec(function(err, users) {
    if (err) {
      return res.status(400).send(errorHandler.getErrorResponse(2));
    } else {
      res.jsonp(users);
    }
  });
};

exports.addFriend = function(req, res) {
  var newFriendRequest = req.body;

  if (req.user) {
    User.findById(req.user.id, function(err, user) {
      if (!err && user) {
        user.friends.push(newFriendRequest.requester);

        user.save(function(err) {
          if (err) {
            return res.status(400).send(errorHandler.getErrorResponse(2));
          } else {
            res.send('New friend added.');
          }
        });

      } else {
        res.status(400).send({
          message: 'User is not found.'
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in.'
    });
  }
};
