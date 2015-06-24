'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Issue = mongoose.model('Issue'),
	_ = require('lodash');

var async = require('async');
var etherpadApi = require('etherpad-lite-client');

// the apikey is found when installing etherpad locally
var etherpad = etherpadApi.connect({
  apikey: '96a331ca0a3f728fe38308ac25c75d7bbef29d22f611b365f861d947f0869140',
  host: 'localhost',
  port: 9001
});

/**
 * Create a Issue
 */
exports.create = function(req, res) {
	async.waterfall([
		function(callback) {
			var issue = new Issue(req.body);
			issue.user = req.user;

			issue.save(function(error) {
				if (error) {
					var err = {message: errorHandler.getErrorMessage(err)};
				}
				callback(err, issue);
			});
		},
		function(issue, callback) {
			var args = {
				groupID: '',
				padName: '',
				text: 'Helloworld'
			};
			args["groupID"] = req.user.groupId;
			args["padName"] = issue._id.toString();

			etherpad.createGroupPad(args, function(error, data) {
				if (error) {
					var err = error.message;
				} else {
					issue.padId = data.padID;
				}
				callback(err, issue);
			});
		},
		function(issue, callback) {
			issue.save(function(error) {
				if (error) {
					var err = {message: errorHandler.getErrorMessage(err)};
				} else {
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

/**
 * Show the current Issue
 */
exports.read = function(req, res) {
	res.jsonp(req.issue);
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
		if (err) return next(err);
		if (! issue) return next(new Error('Failed to load Issue ' + id));
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
