'use strict';

// Configuring the Articles module
angular.module('issues').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('navigationBar', 'Issues', 'issues', 'dropdown', '/issues(/create)?');
    Menus.addSubMenuItem('navigationBar', 'issues', 'List Issues', 'issues');
    Menus.addSubMenuItem('navigationBar', 'issues', 'New Issue', 'issues/create');
  }
]);
