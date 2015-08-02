'use strict';

/*
 * Setting up users route.
 */
angular.module('users').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.

    // User profile state routing.
    state('profile', {
      url: '/:username',
      templateUrl: '/modules/users/views/profile/profile.client.view.html'
    }).

    // User friends state routing.
    state('friends', {
      abstract: true,
      url: '/friends',
      template: '<ui-view/>'
    }).
    state('friends.search', {
      url: '/search',
      templateUrl: '/modules/users/views/friends/find-friends.client.view.html'
    }).
    state('friends.requests', {
      url: '/requests',
      templateUrl: '/modules/users/views/friends/friend-requests.client.view.html'
    }).
    state('friends.myfriends', {
      url: '/myfriends',
      templateUrl: '/modules/users/views/friends/my-friends.client.view.html'
    }).

    // User settings state routing.
    state('settings', {
      abstract: true,
      url: '/settings',
      templateUrl: '/modules/users/views/settings/settings.client.view.html'
    }).
    state('settings.profile', {
      url: '/profile',
      templateUrl: '/modules/users/views/settings/manage-profile.client.view.html'
    }).
    state('settings.credentials', {
      url: '/credentials',
      templateUrl: '/modules/users/views/settings/manage-credentials.client.view.html'
    }).
    state('settings.accounts', {
      url: '/accounts',
      templateUrl: '/modules/users/views/settings/manage-social-accounts.client.view.html'
    }).

    // User password state routing.
    state('password', {
      abstract: true,
      url: '/password',
      template: '<ui-view/>'
    }).
    state('password.forgot', {
      url: '/forgot',
      templateUrl: '/modules/users/views/password/forgot-password.client.view.html'
    }).
    state('password.reset', {
      abstract: true,
      url: '/reset',
      template: '<ui-view/>'
    }).
    state('password.reset.invalid', {
      url: '/invalid',
      templateUrl: '/modules/users/views/password/reset-password-invalid.client.view.html'
    }).
    state('password.reset.success', {
      url: '/success',
      templateUrl: '/modules/users/views/password/reset-password-success.client.view.html'
    }).
    state('password.reset.form', {
      url: '/:token',
      templateUrl: '/modules/users/views/password/reset-password.client.view.html'
    });
  }
]);
