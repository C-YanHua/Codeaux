'use strict';

// Module dependencies.
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var etherpad = require('./etherpad/etherpad.server.controller');
var Issue = mongoose.model('Issue');

/*
 * Create a Issue.
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
        text: 'Helloworld'

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
 * Show the current Issue.
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

  issue = _.extend(issue , req.body);

  issue.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(issue);
    }
  });
};

/**
 * Delete an Issue.
 */
exports.delete = function(req, res) {
  var issue = req.issue;

  issue.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(issue);
    }
  });
};

/**
 * List of Issues.
 */
exports.list = function(req, res) {

  if (req.query.user) {
    Issue.find({
      user : mongoose.Types.ObjectId.createFromHexString(req.query.user)
    }).sort('-created').exec(function(err, issues) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(issues);
      }
    });
  } else {
    Issue.find().sort('-created').populate('user', 'name').exec(function(err, issues) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(issues);
      }
    });
  }
};

/**
 * Issue middleware.
 */
exports.issueById = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send({
      message: 'Issues is invalid'
    });
  }

  Issue.findById(id).populate('user', 'name').exec(function(err, issue) {
    if (err) {
      return next(err);
    }

    if (!issue) {
      return next(new Error('Failed to load Issue ' + id));
    }

    req.issue = issue;
    next();
  });
};
