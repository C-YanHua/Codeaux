'use strict';

// Modal service used for managing modals.
angular.module('core').service('Modals', ['$modal',
  function($modal) {
    // Define a set of default roles.
    this.defaultRoles = ['*'];

    // Define the modals object.
    this.modals = {};

    // A private controller to provide the modal instances with basic modal event functions.
    var controllerInstance = ['$scope', '$modalInstance',
      function($scope, $modalInstance) {
        $scope.closeModal = function() {
          $modalInstance.close();
        };

        $scope.dismissModal = function(message) {
          $modalInstance.dismiss(message);
        };
      }
    ];

    // A private function to check if user or the modal itself is accessible.
    var hasAccess = function(user) {
      if (user) {
        if (~this.roles.indexOf('*')) {
          return true;

        } else {
          for (var index in user.roles) {
            if (this.roles.indexOf(user.roles[index]) !== -1) {
              return true;
            }
          }

          // If no roles matches the current user role.
          return false;
        }
      }

      // If user object is null.
      return this.isPublic;
    };

    // Validate whether modal exists.
    this.validateModalExists = function(modalId) {
      if (modalId && modalId.length) {
        if (this.modals[modalId]) {
          return true;

        } else {
          throw new Error('Modal does not exists.');
        }

      } else {
        throw new Error('ModalId was not provided.');
      }

      return false;
    };

    // Get the modal object by modalId.
    this.getModalById = function(modalId) {
      this.validateModalExists(modalId);

      return this.modals[modalId];
    };

    // Add a new modal object by modalId.
    this.addModal = function(modalId, modalOptions) {
      var options = modalOptions || {};

      this.modals[modalId] = {
        openModal: function() {
          $modal.open({
            templateUrl: options.templateUrl,
            size: options.size,
            controller: options.controller || controllerInstance
          });
        },

        // Modal access controls.
        isPublic: options.isPublic || true,
        roles: options.roles || this.defaultRoles,
        hasAccess: hasAccess
      };

      return this.modals[modalId];
    };

    // Remove an existing modal object by modalId.
    this.removeModalById = function(modalId) {
      this.validateModalExists(modalId);

      delete this.modals[modalId];
    };
  }
]);
