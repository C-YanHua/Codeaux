'use strict';

angular.module('issues').controller('CreateIssuesController', ['$scope', '$stateParams', '$location',
                                                               'Authentication', 'Issues', '$http', '$state',
  function($scope, $stateParams, $location, Authentication, Issues, $http, $state) {
    if (!Authentication.user) {
      $state.go('404-page-not-found');
    }

    $scope.authentication = Authentication;

    $scope.permissions = [];

    $scope.getInfo = function() {
      $http.get('api/users/searchFriends').success(function(friends) {
        $scope.myFriends = friends;
        for (var i=0; i<$scope.myFriends.length; i++) {
          $scope.permissions.push('None');
        }
      }).error(function(response) {
        console.log('Error with http request for friends');
        console.log(response);
        $scope.myFriends = [];
      });
    };

    // Create new Issue.
    $scope.create = function() {
      // Create new Issue object.
      var issue = new Issues ({
        title: this.title,
        description: this.description,
        isPrivate: this.isPrivate
      });

      issue.readWrite = [];
      issue.readOnly = [];

      for(var i=0; i<$scope.permissions.length; i++) {
        if ($scope.permissions[i] === 'ReadWrite') {
          issue.readWrite.push($scope.myFriends[i]._id);
        } else if ($scope.permissions[i] === 'ReadOnly') {
          issue.readOnly.push($scope.myFriends[i]._id);
        }
      }

      // Redirect after save.
      issue.$save(function(response) {
        $location.path('issues/' + response._id);

        // Clear form fields.
        $scope.title = '';
        $scope.description = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);
