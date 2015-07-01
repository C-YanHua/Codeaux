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
  etherpadInstance.createAuthor(args, function(error, data) {
    if (!error) {
      user.authorId = data.authorID;
    }

    callback(error, user);
  });
};

module.exports.createGroup = function(user, callback) {
  etherpadInstance.createGroup(function(error, data) {
    if (!error) {
      user.groupId = data.groupID;
    }

    callback(error, user);
  });
};

module.exports.createPad = function(args, issue, callback) {
  etherpadInstance.createGroupPad(args, function(error, data) {
    if (!error) {
      issue.padId = data.padID;
    }

    callback(error, issue);
  });
};

module.exports.createSession = function(args, req, res, callback) {
  etherpadInstance.createSession(args, function(error, data) {
    if (!error) {
      var sessionId = data.sessionID;

      res.cookie('sessionID', sessionId, {maxAge: 900000, httpOnly: false, secure: false});
      res.jsonp(req.issue);
    }

    callback(error);
  });
};

module.exports.deleteSession = function(args) {
  etherpadInstance.deleteSession(args);
};

module.exports.getReadOnlyID = function(args, issue, callback) {
  etherpadInstance.getReadOnlyID(args, function(error, data) {
    if (!error) {
      issue.readOnlyPadId = data.readOnlyID;
    }

    callback(error, issue);
  });
};
