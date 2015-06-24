'use strict';

angular.module('core').controller('NavigationBarController', ['$scope', 'Authentication', 'Menus', 'Modals',
  function($scope, Authentication, Menus, Modals) {
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.navBarMenu = Menus.getMenuById('navigationBar');
    $scope.signUpModal = Modals.getModalById('signup');
    $scope.signInModal = Modals.getModalById('signin');

    $scope.toggleCollapsibleMenu = function() {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation.
    $scope.$on('$stateChangeSuccess', function() {
      $scope.isCollapsed = false;
    });
  }
]);
