'use strict';

// Configuring the Articles module
angular.module('issues').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('navigationBar', 'Issues', '/issues', 'dropdown');
    Menus.addSubMenuItem('navigationBar', '/issues', 'List Issues', '/issues', 'listIssues');
    Menus.addSubMenuItem('navigationBar', '/issues', 'New Issue', '/issues/create', 'createIssue');
  }
]);
