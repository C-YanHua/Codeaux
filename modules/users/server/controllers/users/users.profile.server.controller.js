'use strict';

// Module dependencies.
var _ = require('lodash');
var fs = require('fs');
var mongoose = require('mongoose');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var User = mongoose.model('User');

/*
 * Function to validate if properties parse when signing up are empty.
 * Returns error message for properties that are empty.
 */
var updateUser = function(req, res, query, profile) {
  User.findOneAndUpdate(query, profile, {new: true}, function(err, user) {
    if (err) {
      res.status(400).send(errorHandler.getErrorResponse(2));
    } else if (!user) {
      res.status(400).send(errorHandler.getErrorResponse(501));
    } else {
      res.json(user);
    }
  });
};

/*
 * Retrieve user profile.
 */
exports.read = function(req, res) {
  res.jsonp(req.profile);
};

/*
 * Update user profile.
 */
exports.updateProfile = function(req, res) {
  if (req.user) {
    var query = {_id: req.user._id};
    // Only these properties will be updated.
    var properties = ['link', 'location', 'name'];

    var profile = _.pick(req.body, properties);
    profile.updated = Date.now();

    updateUser(req, res, query, profile);
  } else {
    res.status(401).send(errorHandler.getErrorResponse(502));
  }
};

/*
 * Update profile picture.
 */
exports.changeProfilePicture = function(req, res) {
  var user = req.user;

  if (user) {
    fs.writeFile('./modules/users/client/img/profile/uploads/' +
                 req.files.file.name, req.files.file.buffer, function(uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.imageUrl = 'modules/users/img/profile/uploads/' + req.files.file.name;

        user.save(function(saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function(err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
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
