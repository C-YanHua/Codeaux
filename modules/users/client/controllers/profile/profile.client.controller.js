'use strict';

angular.module('users').controller('ProfileController', ['$scope', '$stateParams', '$state',
                                                         'UserProfile', 'UserIssues', 'Authentication',
  function($scope, $stateParams, $state, UserProfile, UserIssues, Authentication) {
    $scope.isOwner = false;
    $scope.isFriendOrOwner = false;
    $scope.authentication = Authentication;

    $scope.issues = [];
    $scope.publicIssues = [];
    $scope.privateIssues = [];

    $scope.findUserProfile = function() {
      $scope.profile = UserProfile.get({username: $stateParams.username});
    };

    $scope.findUserIssues = function() {
      var issues = UserIssues.get({username: $stateParams.username}, function() {
        $scope.issues = issues.slice(0, issues.length);
        $scope.publicIssues = issues.filter(filterPublicIssues);
        $scope.privateIssues = issues.filter(filterPrivateIssues);

        $scope.isOwner = isOwner($scope.authentication.user, $scope.profile);
        $scope.isFriendOrOwner = isFriendOrOwner($scope.authentication.user, $scope.profile);
        if (!$scope.isFriendOrOwner) {
          $scope.issues = $scope.publicIssues;
        }
      });
    };

    function isOwner(user, profile) {
      return angular.equals(user, profile);
    }

    function isFriendOrOwner(user, profile) {
      return angular.equals(user, profile) || profile.friends.indexOf(user._id) !== -1;
    }

    function filterPrivateIssues(obj) {
      return 'isPrivate' in obj && typeof(obj.isPrivate) === 'number' && obj.isPrivate === 1;
    }

    function filterPublicIssues(obj) {
      return 'isPrivate' in obj && typeof(obj.isPrivate) === 'number' && obj.isPrivate === 0;
    }
  }
]);
