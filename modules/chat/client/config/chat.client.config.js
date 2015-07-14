'use strict';

// Configuring the Chat module.
angular.module('chat').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('navigationbar', {
      title: 'Chat',
      state: 'chat'
    });
  }
]);
