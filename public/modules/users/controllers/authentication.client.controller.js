'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location',
                                   'Authentication', 'Modals',
  function($scope, $http, $location, Authentication, Modals) {
    $scope.authentication = Authentication;
    $scope.signUpModal = Modals.getModalById('signup');
    $scope.signInModal = Modals.getModalById('signin');

    // If user is signed in then redirect back home.
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function() {
      $http.post('auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model.
        $scope.authentication.user = response;

        $scope.closeModal();
        // Redirect back to the index page.
        $location.path('/');
      }).error(function(response) {
        $scope.error = response.message;
        console.log($scope.error);
      });
    };

    $scope.signin = function() {
      $http.post('auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model.
        $scope.authentication.user = response;

        $scope.closeModal();
        // Redirect back to the index page.
        $location.path('/');
      }).error(function(response) {
        $scope.error = response.message;
      });
    };
  }
]);

/*
angular.module('users').directive('validateEmail', function() {
  var EMAIL_REGEXP = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
  return {
    require: 'ngModel',
    restrict: '',
    link: function(scope, elm, attrs, ctrl) {

      function customValidator(value) {
        if (EMAIL_REGEXP.test(value)) {
          ctrl.$setValidity('emailValidator', true);
        } else {
          ctrl.$setValidity('emailValidator', false);
        }

        return value;
      }

      ctrl.$parsers.push(customValidator);
    }
  }
});*/
