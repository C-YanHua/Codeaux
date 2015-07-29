'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile.
    $scope.updateUserProfile = function(isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var testcase = {
          _id: $scope.user._id,
          name: 'test',
          location: 'singapore',
          link: 'www.something.com'
        };

        var user = new Users(testcase);

        user.$update(function(response) {
          $scope.success = true;
          console.log('wtf', Authentication.user);
          console.log(response);
          Authentication.user = response;
          console.log('after', Authentication.user);
        }, function(response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };
  }
]);
