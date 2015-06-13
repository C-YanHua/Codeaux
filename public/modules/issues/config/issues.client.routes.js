'use strict';

//Setting up route
angular.module('issues').config(['$stateProvider',
  function($stateProvider) {
    // Issues state routing
    $stateProvider.
    state('listIssues', {
      url: '/issues',
      templateUrl: '/modules/issues/views/list-issues.client.view.html'
    }).
    state('createIssue', {
      url: '/issues/create',
      templateUrl: '/modules/issues/views/create-issue.client.view.html'
    }).
    state('viewIssue', {
      url: '/issues/:issueId',
      templateUrl: '/modules/issues/views/view-issue.client.view.html'
    }).
    state('editIssue', {
      url: '/issues/:issueId/edit',
      templateUrl: '/modules/issues/views/edit-issue.client.view.html'
    });
  }
]);
