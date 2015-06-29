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

    $scope.usernameErrorMessage = null;
    $scope.validateUsername = function() {
      return $http.post('auth/signup_validate/username', $scope.credentials);
    };

    $scope.emailErrorMessage = null;
    $scope.validateEmail = function() {
      return $http.post('auth/signup_validate/email', $scope.credentials);
    };

    $scope.passwordErrorMessage = null;
    $scope.validatePassword = function() {
      return $http.post('auth/signup_validate/password', $scope.credentials);
    };
  }
]);

angular.module('users').directive('validateUsername', function() {
  return {
    require: 'ngModel',
    restrict: '',
    link: function(scope, element, attributes, ngModel) {

      function customValidator(value) {
        scope.validateUsername().success(function() {
          scope.usernameErrorMessage = null;
          ngModel.$setValidity('usernameValidation', true);

        }).error(function(response) {
          scope.usernameErrorMessage = response.message;
          ngModel.$setValidity('usernameValidation', false);
        });

        return value;
      }

      ngModel.$parsers.push(customValidator);
    }
  };
});

angular.module('users').directive('validateEmail', function() {
  return {
    require: 'ngModel',
    restrict: '',
    link: function(scope, element, attributes, ngModel) {

      function customValidator(value) {
        scope.validateEmail().success(function() {
          scope.emailErrorMessage = null;
          ngModel.$setValidity('emailValidation', true);

        }).error(function(response) {
          scope.emailErrorMessage = response.message;
          ngModel.$setValidity('emailValidation', false);
        });

        return value;
      }

      function disableBuiltInValidator() {
        return true;
      }

      ngModel.$parsers.push(customValidator);
      ngModel.$validators.email = disableBuiltInValidator;
    }
  };
});

angular.module('users').directive('validatePassword', function() {
  return {
    require: 'ngModel',
    restrict: '',
    link: function(scope, element, attributes, ngModel) {

      function customValidator(value) {
        scope.validatePassword().success(function() {
          scope.passwordErrorMessage = null;
          ngModel.$setValidity('passwordValidation', true);

        }).error(function(response) {
          scope.passwordErrorMessage = response.message;
          ngModel.$setValidity('passwordValidation', false);
        });

        return value;
      }

      function disableBuiltInValidator() {
        return true;
      }

      ngModel.$parsers.push(customValidator);
      ngModel.$validators.password = disableBuiltInValidator;
    }
  };
});
