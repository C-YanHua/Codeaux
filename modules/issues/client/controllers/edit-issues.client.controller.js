'use strict';

angular.module('issues').controller('EditIssuesController', ['$scope', '$stateParams', '$location',
                                                       'Authentication', 'Issues',
  function($scope, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    // Find existing Issue.
    $scope.findOne = function() {
      $scope.issue = Issues.get({issueId: $stateParams.issueId});
    };

    // Update existing Issue.
    $scope.update = function() {
      var issue = $scope.issue;

      issue.$update(function() {
        $location.path('issues/' + issue._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
