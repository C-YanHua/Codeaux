'use strict';

// Module dependencies.
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var etherpad = require('./etherpad/etherpad.server.controller');
var Issue = mongoose.model('Issue');

var findIssueById = function(id, populate, callback) {
  Issue.findById(id).populate('owner', populate).exec(function(err, issue) {
    callback(err, issue);
  });
};

var findIssues = function(query, sort, populate, callback) {
  Issue.find(query).sort(sort).populate('owner', populate).exec(function(err, issues) {
    if (err) {
      callback(null);
    } else {
      callback(issues);
    }
  });
};

var sendIssues = function(res, issues) {
  if (issues) {
    res.jsonp(issues);
  } else {
    res.status(400).send(errorHandler.getErrorResponse(2));
  }
};

/*
 * Create an issue.
 */
exports.create = function(req, res) {
  async.waterfall([
    function(callback) {
      var issue = new Issue(req.body);
      issue.owner = req.user;

      issue.save(function(err) {
        callback(err, issue);
      });
    },
    // Generate a unique padId for the issue.
    function(issue, callback) {
      etherpad.generatePadId({
        groupID: req.user.groupId,
        padName: issue._id.toString(),
        text: ''

      }, issue, callback);
    },
    function(issue, callback) {
      etherpad.generateReadOnlyPadId({padID: issue.padId}, issue, callback);
    },
    function(issue, callback) {
      issue.save(function(err) {
        if (!err) {
          res.jsonp(issue);
        }

        callback(err);
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).send(err);
    }
  });
};

/*
 * Show the selected issue.
 */
exports.read = function(req, res) {
  async.waterfall([
    function(callback) {
      var issue = req.issue;
      var sessionTime = (Math.floor(Date.now() / 1000) + 216000);
      var userSession = {
        groupID: issue.padId.substr(0, issue.padId.indexOf('$')),
        authorID: '',
        validUntil: sessionTime
      };

      // Append etherpadUrl to padId and readOnlyPadId for displaying on page.
      req.issue.padId = etherpad.getEtherpadUrl() + '/p/' + issue.padId;
      req.issue.readOnlyPadId = etherpad.getEtherpadUrl() + '/p/' + issue.readOnlyPadId;

      // Kill the previous etherpad session before starting a new one.
      if (req.cookies.sessionID) {
        etherpad.deleteSession({sessionID: req.cookies.sessionID});
      }

      if (req.user) {
        userSession.authorID = req.user.authorId;
        callback(null, userSession);
      } else {
        etherpad.generateAuthorId({name: ''}, userSession, callback);
      }
    },
    function(userSession, callback) {
      etherpad.createSession(userSession, req, res, callback);
    }
  ], function(err) {
    if (err) {
      return res.status(400).send(err);
    }
  });
};

/*
 * Update a Issue.
 */
exports.update = function(req, res) {
  var issue = req.issue;
  req.body.padId = req.issue.padId.replace(etherpad.getEtherpadUrl + '/p/', '');
  req.body.readOnlyPadId = req.issue.readOnlyPadId.replace(etherpad.getEtherpadUrl + '/p/', '');

  issue = _.extend(issue , req.body);

  issue.save(function(err) {
    if (err) {
      return res.status(400).send(errorHandler.getErrorResponse(2));
    } else {
      res.jsonp(issue);
    }
  });
};

/*
 * Delete an Issue.
 */
exports.delete = function(req, res) {
  var issue = req.issue;

  issue.remove(function(err) {
    if (err) {
      return res.status(400).send(errorHandler.getErrorResponse(2));
    } else {
      res.jsonp(issue);
    }
  });
};

/*
 * List all the issues.
 */
exports.listAllIssues = function(req, res) {
  findIssues('', '-created', 'username name', function(issues) {
    sendIssues(res, issues);
  });
};

/*
 * List all public issues.
 */
exports.listPublicIssues = function(req, res) {
  var query = {isPrivate: 0};
  findIssues(query, '-created', 'username name', function(issues) {
    sendIssues(res, issues);
  });
};

/*
 * List all private issues.
 */
exports.listPrivateIssues = function(req, res) {
  var query = {isPrivate: 1};
  findIssues(query, '-created', 'username name', function(issues) {
    sendIssues(res, issues);
  });
};

/*
 * List user issues.
 */
exports.listUserIssues = function(req, res) {
  var query = {owner: (req.profile) ? req.profile._id : req.user._id};
  findIssues(query, '-created', 'username name', function(issues) {
    sendIssues(res, issues);
  });
};

/*
 * List all issues belonging to the user's friends.
 */
exports.listUserFriendsIssues = function(req, res) {
  var query = {owner: {$in: (req.profile) ? req.profile.friends : req.user.friends}};
  findIssues(query, '-created', 'username name', function(issues) {
    sendIssues(res, issues);
  });
};

/*
 * List all issues belonging to the user's friends and the user.
 */
exports.listUserAndFriendsIssues = function(req, res) {
  var issues = null;
  var query = {owner: (req.profile) ? req.profile._id : req.user._id};

  findIssues(query, '-created', 'username name', function(ownerIssues) {
    query = {owner: {$in: (req.profile) ? req.profile.friends : req.user.friends}};

    findIssues(query, '-created', 'username name', function(friendsIssues) {
      issues = _.union(ownerIssues, friendsIssues);

      sendIssues(res, issues);
    });
  });
};

/*
 * Find issue by id middleware.
 * Redirects to route not found if id does not exists.
 */
exports.issueById = function(req, res, next, id) {
  findIssueById(id, 'username name', function(err, issue) {
    if (err || !issue) {
      return res.redirect('/404-page-not-found');
    }

    req.issue = issue;
    next();
  });
};
