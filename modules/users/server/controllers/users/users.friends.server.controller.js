'use strict';

// Module dependencies.
var _ = require('lodash');
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
    var query = {'_id':req.user._id};
    var fieldsToUpdate = _.pick(req.user, 'friends');
    fieldsToUpdate.friends.push(newFriendRequest.requester);

    User.findOneAndUpdate(query, fieldsToUpdate, {new: true}, function(err, user) {
      if (err) {
        res.status(400).send(errorHandler.getErrorResponse(2));
      } else if (!user) {
        res.status(400).send(errorHandler.getErrorResponse(501));
      } else {

        // Find friend and friend's friends array will add current user
        User.findById(newFriendRequest.requester, function(err, friend) {
          if (!err && friend) {
            var friendQuery = {'_id':friend._id};
            var friendFieldsToUpdate = _.pick(friend, 'friends');
            friendFieldsToUpdate.friends.push(newFriendRequest.receiver);

            User.findOneAndUpdate(friendQuery, friendFieldsToUpdate, {new: true}, function(err, friendUser) {
              if (err) {
                res.status(400).send(errorHandler.getErrorResponse(2));
              } else if (!friendUser) {
                res.status(400).send(errorHandler.getErrorResponse(501));
              } else {
                res.send('Friend is added.');
              }
            });
          } else {
            res.status(400).send({
              message: 'Friend is not found.'
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in.'
    });
  }
};

exports.removeFriend = function(req, res) {
  var friend = req.body;

  if (req.user) {
    var query = {'_id':req.user._id};
    var fieldsToUpdate = _.pick(req.user, 'friends');
    var friendIndex = fieldsToUpdate.friends.indexOf(friend._id);
    fieldsToUpdate.friends.splice(friendIndex, 1);

    User.findOneAndUpdate(query, fieldsToUpdate, {new: true}, function(err, user) {
      if (err) {
        res.status(400).send(errorHandler.getErrorResponse(2));
      } else if (!user) {
        res.status(400).send(errorHandler.getErrorResponse(501));
      } else {

        var friendQuery = {'_id':friend._id};
        var friendFieldsToUpdate = _.pick(friend, 'friends');
        var userIndex = friendFieldsToUpdate.friends.indexOf(user._id);
        friendFieldsToUpdate.friends.splice(userIndex, 1);

        User.findOneAndUpdate(friendQuery, friendFieldsToUpdate, {new: true}, function(err, friendUser) {
          if (err) {
            res.status(400).send(errorHandler.getErrorResponse(2));
          } else if (!friendUser) {
            res.status(400).send(errorHandler.getErrorResponse(501));
          } else {
            res.send('Friend is removed.');
          }
        });
      }
    });

  } else {
    res.status(400).send({
      message: 'User is not signed in.'
    });
  }
};

exports.searchFriends = function(req, res) {
  User.findById(req.user._id)
  .sort('-created')
  .populate('friends', 'username name imageUrl friends')
  .exec(function(err, user) {

    if (err) {
      res.status(400).send(errorHandler.getErrorResponse(2));
    } else if (!user) {
      res.status(400).send(errorHandler.getErrorResponse(501));
    } else {
      res.jsonp(user.friends);
    }
  });
};
