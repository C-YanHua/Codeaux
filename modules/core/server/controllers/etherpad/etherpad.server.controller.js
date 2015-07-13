'use strict';

var etherpadApi = require('etherpad-lite-client');

var etherpadInstance = null;

// Initialize etherpad client connection to etherpad server.
if (!etherpadInstance) {
  etherpadInstance = etherpadApi.connect({
    apikey: process.env.ETHERPAD_APIKEY,
    host: 'localhost',
    port: 9001
  });
}

module.exports.createAuthor = function(args, user, callback) {
  etherpadInstance.createAuthor(args, function(err, data) {
    if (!err) {
      if (user.authorId === '') {
        user.authorId = data.authorID;
      } else if (user.authorID === '') {
        user.authorID = data.authorID;
      }
    }

    callback(err, user);
  });
};

module.exports.createGroup = function(user, callback) {
  etherpadInstance.createGroup(function(err, data) {
    if (!err) {
      user.groupId = data.groupID;
    }

    callback(err, user);
  });
};

module.exports.createPad = function(args, issue, callback) {
  etherpadInstance.createGroupPad(args, function(err, data) {
    if (!err) {
      issue.padId = data.padID;
    }

    callback(err, issue);
  });
};

module.exports.createSession = function(args, req, res, callback) {
  etherpadInstance.createSession(args, function(err, data) {
    if (!err) {
      var sessionId = data.sessionID;

      res.cookie('sessionID', sessionId, {maxAge: 900000, httpOnly: false, secure: false});
      res.jsonp(req.issue);
    }

    callback(err);
  });
};

module.exports.deleteSession = function(args) {
  etherpadInstance.deleteSession(args);
};

module.exports.getReadOnlyID = function(args, issue, callback) {
  etherpadInstance.getReadOnlyID(args, function(err, data) {
    if (!err) {
      issue.readOnlyPadId = data.readOnlyID;
    }

    callback(err, issue);
  });
};
