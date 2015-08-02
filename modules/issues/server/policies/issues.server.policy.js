'use strict';

// Module dependencies.
var acl = require('acl');

// Using the memory backend.
acl = new acl(new acl.memoryBackend());

/*
 * Invoke Issues Permissions.
 */
exports.invokeRolesPolicies = function() {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/issues',
      permissions: '*'
    }, {
      resources: '/api/issues/:issueId',
      permissions: '*'
    }, {
      resources: '/api/:username/issues',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/issues',
      permissions: ['get', 'post']
    }, {
      resources: '/api/issues/:issueId',
      permissions: ['get', 'post', 'put']
    }, {
      resources: '/api/:username/issues',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/issues',
      permissions: ['get']
    }, {
      resources: '/api/issues/:issueId',
      permissions: ['get']
    }, {
      resources: '/api/:username/issues',
      permissions: ['get']
    }]
  }]);
};

/*
 * Check If Issues Policy Allows.
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an issue is being processed and the current user created it then allow any manipulation.
  if (req.issue && req.user && (req.issue.owner.id === req.user.id)) {
    return next();
  }

  // Check for user roles.
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.redirect('/500-server-error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware.
        return next();
      } else {
        return res.redirect('/403-forbidden');
      }
    }
  });
};
