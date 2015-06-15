'use strict';

angular.module('core').run(['Menus',
  function(Menus) {

    // Add menu for application navigation bar (header).
    Menus.addMenu('navigationBar', true);
  }
]);
