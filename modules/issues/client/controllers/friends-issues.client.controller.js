'use strict';

angular.module('issues').controller('FriendsIssuesController', ['$scope', '$stateParams', '$location',
                                                             'Authentication', 'Issues', '$state', '$http',
  function($scope, $stateParams, $location, Authentication, Issues, $state, $http) {
    if (!Authentication.user) {
      $state.go('404-page-not-found');
    }

    $scope.authentication = Authentication;

    var publicIssues = [];
    var privateIssues = [];
    $scope.currentIssues = [];

    $scope.issueType = 'Public';

    $scope.find = function() {
      $http.get('api/issues/my-friends-issues').success(function(issues) {
        for (var i = 0; i < issues.length; i++) {
          var eachIssue = issues[i];
          if (eachIssue.isPrivate === 0) {
            publicIssues.push(eachIssue);
          } else if (eachIssue.isPrivate === 1) {
            privateIssues.push(eachIssue);
          }
        }
        $scope.currentIssues = publicIssues;
      }).error(function(response) {
        console.log(response);
        $scope.currentIssues = [];
      });
    };

    $scope.$watch('issueType', function() {
      if ($scope.issueType == 'Private') {
        $scope.currentIssues = privateIssues;
      } else {
        $scope.currentIssues = publicIssues;
      }
    });

  }
]);
