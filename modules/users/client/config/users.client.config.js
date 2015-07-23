'use strict';

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

