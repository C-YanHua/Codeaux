'use strict';

// Module dependencies.
var _ = require('lodash');
var async = require('async');
var errorHandler = require('./errors.server.controller');
var etherpad = require('./etherpad/etherpad.server.controller');
var mongoose = require('mongoose');
var Issue = mongoose.model('Issue');

/**
 * Create a Issue
 */
exports.create = function(req, res) {
  async.waterfall([
    function(callback) {
      var issue = new Issue(req.body);
      issue.user = req.user;

      issue.save(function(error) {
        callback(error, issue);
      });
    },
    function(issue, callback) {
      etherpad.createPad({
        groupID: req.user.groupId,
        padName: issue._id.toString(),
        text: 'Helloworld'
      },
        issue,
        callback
      );
    },
    function(issue, callback) {
      etherpad.getReadOnlyID({padID: issue.padId}, issue, callback);
    },
    function(issue, callback) {
      issue.save(function(error) {
        if (!error) {
          res.jsonp(issue);
        }

        callback(error);
      });
    }
  ], function(error) {
    if (error) {
      return res.status(400).send(error);
    }
  });
};

/**
 * Show the current Issue
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

      // Close the previous etherpad session before starting a new one
      if (req.cookies.sessionID) {
        etherpad.deleteSession({sessionID: req.cookies.sessionID});
      }

      if (req.user) {
        userSession.authorID = req.user.authorId;
        callback(null, userSession);
      } else {
        etherpad.createAuthor({name: ''}, userSession, callback);
      }

    },
    function(userSession, callback) {
      etherpad.createSession(userSession, req, res, callback);
    }
  ], function(error) {
    if (error) {
      return res.status(400).send(error);
    }
  });
};

/**
 * Update a Issue
 */
exports.update = function(req, res) {
  var issue = req.issue ;

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
 * Delete an Issue
 */
exports.delete = function(req, res) {
  var issue = req.issue ;

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
 * List of Issues
 */
exports.list = function(req, res) {
  Issue.find().sort('-created').populate('user', 'displayName').exec(function(err, issues) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(issues);
    }
  });
};

/**
 * Issue middleware
 */
exports.issueByID = function(req, res, next, id) {
  Issue.findById(id).populate('user', 'displayName').exec(function(err, issue) {
    if (err) {
      return next(err);
    }

    if (!issue) {
      return next(new Error('Failed to load Issue ' + id));
    }

    req.issue = issue ;
    next();
  });
};

/**
 * Issue authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.issue.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
