'use strict';

// Config HTTP Error Handling.
angular.module('users').config(['$httpProvider',
  function($httpProvider) {
    // Set the httpProvider "not authorized" interceptor.
    $httpProvider.interceptors.push(['$q', '$location', '$window', 'Authentication',
      function($q, $location, $window, Authentication) {
        return {
          responseError: function(rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user.
                Authentication.user = null;
                $window.user = null;

                // Redirect to home page.
                $location.path('/');
                break;
              case 403:
                // Add unauthorized behaviour.
                break;
              case 404:
                // Redirect to 404 not found page.
                $location.path('not-found');
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

angular.module('users').run(['Modals',
  function(Modals) {
    var AUTH_VIEW_DIRECTORY = '/modules/users/views/authentication/';

    // Initialize sign up modal.
    Modals.addModal('signup', {
      templateUrl: AUTH_VIEW_DIRECTORY + 'signup.client.view.html',
      size: 'sm'
    });

    // Initialize sign in modal.
    Modals.addModal('signin', {
      templateUrl: AUTH_VIEW_DIRECTORY + 'signin.client.view.html',
      size: 'sm'
    });
  }
]);

