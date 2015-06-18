'use strict';

// Modal service used for managing modals.
angular.module('core').service('Modals', ['$modal',
  function($modal) {
    // Define a set of default roles.
    this.defaultRoles = ['*'];

    // Define the modals object.
    this.modals = {};

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

    this.getModalById = function(modalId) {
      this.validateModalExists(modalId);

      return this.modals[modalId];
    };

    this.addModal = function(modalId, modalTemplateURL, modalController, modalSize,
                             isPublic, roles) {
      this.modals[modalId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        hasAccess: hasAccess,

        openModal: function() {
          $modal.open({
            templateUrl: modalTemplateURL,
            controller: modalController,
            size: modalSize
          });
        }
      };

      return this.modals[modalId];
    };

    this.removeModalById = function(modalId) {
      this.validateModalExists(modalId);

      delete this.modals[modalId];
    };
  }
]);
