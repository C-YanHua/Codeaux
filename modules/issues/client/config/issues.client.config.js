'use strict';

// Issues module configuration.
angular.module('issues').run(['Menus',
  function(Menus) {
    // Add issues dropdown item to navigationbar.
    Menus.addMenuItem('navigationbar', {
      title: 'Issues',
      state: 'issues',
      type: 'dropdown'
    });

    // Add dropdown for list issues.
    Menus.addSubMenuItem('navigationbar', 'issues', {
      title: 'View public issues',
      state: 'issues.list'
    });

    // Add dropdown for create issues.
    Menus.addSubMenuItem('navigationbar', 'issues', {
      title: 'Create new issue',
      state: 'issues.create'
    });
  }
]);
