'use strict';

// Menu service used for managing menus.
angular.module('core').service('Menus', [

  function() {
    // Define a set of default roles.
    this.defaultRoles = ['*'];

    // Define the menus object.
    this.menus = {};

    // A private function to check if user or the menu itself is accessible.
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

    this.isNullOrUndefined = function(item) {
      return (item === null || typeof item === 'undefined');
    };

    // Validate whether menu exists.
    this.validateMenuExists = function(menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists.');
        }
      } else {
        throw new Error('MenuId was not provided.');
      }

      return false;
    };

    // Get the menu object by menuId.
    this.getMenuById = function(menuId) {
      this.validateMenuExists(menuId);

      return this.menus[menuId];
    };

    // Add a new menu object by menuId.
    this.addMenu = function(menuId, menuOptions) {
      var options = menuOptions || {};

      // Create the new menu.
      this.menus[menuId] = {
        items: options.items || [],

        // Menu access controls.
        hasAccess: hasAccess,
        isPublic: (this.isNullOrUndefined(options.isPublic) ? true : options.isPublic),
        roles: options.roles || this.defaultRoles
      };

      return this.menus[menuId];
    };

    // Remove an existing menu object by menuId.
    this.removeMenuById = function(menuId) {
      this.validateMenuExists(menuId);

      delete this.menus[menuId];
    };

    // Add a new child menu item object to root menu.
    this.addMenuItem = function(menuId, menuItemOptions) {
      var options = menuItemOptions || {};

      this.validateMenuExists(menuId);

      // Push new menu item to menu.
      this.menus[menuId].items.push({
        class: options.class,
        items: [],
        position: options.position || 0,
        state: options.state || '',
        title: options.title || '',
        type: options.type || 'item',

        // Menu item access controls.
        hasAccess: hasAccess,
        isPublic: (this.isNullOrUndefined(options.isPublic) ? this.menus[menuId].isPublic : options.isPublic),
        roles: (this.isNullOrUndefined(options.roles) ? this.menus[menuId].roles : options.roles)
      });

      // Add submenu items.
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      return this.menus[menuId];
    };

    // Remove an existing menu object by menuId.
    this.removeMenuItemByState = function(menuId, menuItemState) {
      this.validateMenuExists(menuId);

      // Search for menu item to remove.
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      return this.menus[menuId];
    };

    // Add a child sub-menu item object to menu item object.
    this.addSubMenuItem = function(menuId, parentItemState, subMenuItemOptions) {
      var options = subMenuItemOptions || {};

      this.validateMenuExists(menuId);

      // Search for menu item.
      for (var itemIndex in this.menus[menuId].items) {
        // Push new sub-menu item if menu item exists.
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          this.menus[menuId].items[itemIndex].items.push({
            position: options.position || 0,
            state: options.state || '',
            title: options.title || '',

            // Sub Menu item access controls.
            hasAccess: hasAccess,
            isPublic: (this.isNullOrUndefined(options.isPublic) ?
                       this.menus[menuId].items[itemIndex].isPublic : options.isPublic),
            roles: (this.isNullOrUndefined(options.isPublic) ?
                    this.menus[menuId].items[itemIndex].roles : options.roles)
          });
        }
      }

      return this.menus[menuId];
    };

    // Remove existing sub-menu object by sub-menu state.
    this.removeSubMenuItemByState = function(menuId, submenuItemState) {
      this.validateMenuExists(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      return this.menus[menuId];
    };
  }
]);
