'use strict';

/*
 * Setting up issues route.
 */
module.exports = function(app) {
  // Issues routing.
  var issues = require('../controllers/issues.server.controller');
  var issuesPolicy = require('../policies/issues.server.policy');

  app.route('/api/issues').all(issuesPolicy.isAllowed)
    .get(issues.listPublicIssues)
    .post(issues.create);

  app.route('/api/issues/my-issues').all(issuesPolicy.isAllowed)
    .get(issues.listUserAndFriendsIssues);

  app.route('/api/:username/issues').all(issuesPolicy.isAllowed)
    .get(issues.listUserIssues);

  // Single article routes.
  app.route('/api/issues/:issueId').all(issuesPolicy.isAllowed)
    .get(issues.read)
    .put(issues.update)
    .delete(issues.delete);

  // Finish by binding the article middleware.
  app.param('issueId', issues.issueById);
};
