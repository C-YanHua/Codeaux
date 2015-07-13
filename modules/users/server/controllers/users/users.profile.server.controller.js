'use strict';

// Module dependencies.
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Send User profile.
exports.read = function(req, res) {
  res.jsonp(req.profile);
};

/**
 * Update user details.
 */
exports.update = function(req, res) {
  // Init Variables.
  var user = req.user;

  // For security measurement we remove the roles from the req.body object.
  delete req.body.roles;

  if (user) {
    // Merge existing user.
    user = _.extend(user, req.body);
    user.updated = Date.now();

    user.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
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
  } else {
    res.status(400).send({
      message: 'User is not signed in.'
    });
  }
};

/**
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
        user.profileImageUrl = 'modules/users/img/profile/uploads/' + req.files.file.name;

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

