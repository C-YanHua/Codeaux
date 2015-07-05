'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location',
                                   'Authentication', 'Modals',
  function($scope, $http, $location, Authentication, Modals) {
    // If user is signed in then redirect back home.
    if (Authentication.user) {
      $location.path('/');
    }

    $scope.signupModal = Modals.getModalById('signup');
    $scope.signinModal = Modals.getModalById('signin');

    $scope.authentication = Authentication;
    $scope.credentials = {
      username: '',
      email: '',
      password: ''
    };

    $scope.signupErrorMessage = null;
    $scope.signup = function() {
      $http.post('auth/signup', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model.
        $scope.authentication.user = response;

        $scope.closeModal();
        // Redirect back to the index page.
        $location.path('/');

      }).error(function(response) {
        $scope.signupErrorMessage = response.errorMessage;

        for (var key in $scope.credentials) {
          if (response.hasOwnProperty(key)) {
            $scope.setErrorMessage(key, response[key].message, false);
          }
        }
      });
    };

    $scope.signinErrorMessage = null;
    $scope.signin = function() {
      $http.post('auth/signin', $scope.credentials).success(function(response) {
        // If successful we assign the response to the global user model.
        $scope.authentication.user = response;

        $scope.closeModal();
        // Redirect back to the index page.
        $location.path('/');
      }).error(function(response) {
        $scope.signinErrorMessage = response.message;
      });
    };

    $scope.errorMessages = {
      username: {
        message: '',
        ngMessageName: 'usernameValidation',
        isValid: true
      },
      email: {
        message: '',
        ngMessageName: 'emailValidation',
        isValid: true
      },
      password: {
        message: '',
        ngMessageName: 'passwordValidation',
        isValid: true
      }
    };
    $scope.setErrorMessage = function(property, message, isValid) {
      var errorMessage = $scope.errorMessages[property];
      errorMessage.message = message;
      errorMessage.isValid = isValid;

      $scope.signupForm[property].$setValidity(errorMessage.ngMessageName, isValid);
    };
  }
]);
