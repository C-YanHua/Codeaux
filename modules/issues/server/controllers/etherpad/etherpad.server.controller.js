'use strict';

var etherpadApi = require('etherpad-lite-client');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

var etherpadUrl = null;
var etherpadInstance = null;

/*
 * Set etherpad Url.
 */
var setEtherpadUrl = function(host, port) {
  etherpadUrl = 'http://' + host + ':' + port;
};

/*
 * Module initialize function.
 */
module.exports = function(config) {
  // Initialize etherpad client connection to etherpad server.
  setEtherpadUrl(config.etherpad.host, config.etherpad.port);

  etherpadInstance = etherpadApi.connect({
    host: config.etherpad.host,
    port: config.etherpad.port,
    apikey: config.etherpad.apikey
  });
};

/*
 * Get etherpad Url.
 */
module.exports.getEtherpadUrl = function() {
  return etherpadUrl;
};

/*
 * Generate a unique authorId for each user.
 */
module.exports.generateAuthorId = function(args, user, callback) {
  etherpadInstance.createAuthor(args, function(err, data) {
    if (!err) {
      // Catch different casing convention used in different situations.
      if (user.authorId === '') {
        user.authorId = data.authorID;
      } else if (user.authorID === '') {
        user.authorID = data.authorID;
      } else {
        callback(errorHandler.getErrorResponse(3), user);
      }

      callback(null, user);
    } else {
      callback(errorHandler.getErrorResponse(3), user);
    }
  });
};

/*
 * Generate a unique groupId for each user.
 */
module.exports.generateGroupId = function(user, callback) {
  etherpadInstance.createGroup(function(err, data) {
    if (!err) {
      user.groupId = data.groupID;
      callback(null, user);
    } else {
      callback(errorHandler.getErrorResponse(3), user);
    }
  });
};

/*
 * Create a unique pad session for users attempting to connect to the pad.
 */
module.exports.createSession = function(args, req, res, callback) {
  etherpadInstance.createSession(args, function(err, data) {
    if (!err) {
      var sessionId = data.sessionID;

      res.cookie('sessionID', sessionId, {maxAge: 900000, httpOnly: false, secure: false});
      res.jsonp(req.issue);

      callback(null);
    } else {
      callback(errorHandler.getErrorResponse(3));
    }
  });
};

/*
 * Delete user's pad session.
 */
module.exports.deleteSession = function(args) {
  etherpadInstance.deleteSession(args);
};

/*
 * Generate a unique padId for each issue.
 */
module.exports.generatePadId = function(args, issue, callback) {
  etherpadInstance.createGroupPad(args, function(err, data) {
    if (!err) {
      issue.padId = data.padID;
      callback(null, issue);
    } else {
      callback(errorHandler.getErrorResponse(3), issue);
    }
  });
};

/*
 * Generate a unique readOnlyPadId for each issue.
 */
module.exports.generateReadOnlyPadId = function(args, issue, callback) {
  etherpadInstance.getReadOnlyID(args, function(err, data) {
    if (!err) {
      issue.readOnlyPadId = data.readOnlyID;
      callback(null, issue);
    } else {
      callback(errorHandler.getErrorResponse(3), issue);
    }
  });
};
