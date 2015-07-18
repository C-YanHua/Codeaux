'use strict';

angular.module('issues').controller('CreateIssuesController', ['$scope', '$stateParams', '$location',
                                                               'Authentication', 'Issues',
  function($scope, $stateParams, $location, Authentication, Issues) {
    $scope.authentication = Authentication;

    // Create new Issue.
    $scope.create = function() {
      // Create new Issue object.
      var issue = new Issues ({
        name: this.name,
        description: this.description,
        isPrivateIssue: this.isPrivateIssue
      });

      // Redirect after save.
      issue.$save(function(response) {
        $location.path('issues/' + response._id);

        // Clear form fields.
        $scope.name = '';
        $scope.description = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
