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
      title: 'List Issues',
      state: 'issues.list',
    });

    // Add dropdown for create issues.
    Menus.addSubMenuItem('navigationbar', 'issues', {
      title: 'New Issue',
      state: 'issues.create'
    });
  }
]);
