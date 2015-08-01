'use strict';

angular.module('users').run(['Modals', 'Menus',
  function(Modals, Menus) {
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

    // Initialize friend's menu.
    Menus.addMenuItem('navigationbar', {
      title: 'Friends',
      state: 'friends',
      type: 'dropdown'
    });

    Menus.addSubMenuItem('navigationbar', 'friends', {
      title: 'Find Friends',
      state: 'friends.search'
    });

    Menus.addSubMenuItem('navigationbar', 'friends', {
      title: 'Friend Requests',
      state: 'friends.requests'
    });
  }
]);

