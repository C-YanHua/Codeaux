'use strict';

module.exports = function(app) {
  // Issues routing.
  var issues = require('../controllers/issues.server.controller');
  var issuesPolicy = require('../policies/issues.server.policy');

  // Articles collection routes.
  app.route('/api/issues').all(issuesPolicy.isAllowed)
    .get(issues.list)
    .post(issues.create);

  // Single article routes.
  app.route('/api/issues/:issueId').all(issuesPolicy.isAllowed)
    .get(issues.read)
    .put(issues.update)
    .delete(issues.delete);

  // Finish by binding the article middleware.
  app.param('issueId', issues.issueById);
};
