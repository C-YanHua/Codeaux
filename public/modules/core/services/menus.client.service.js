'use strict';

//Menu service used for managing menus.
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

    // Add new menu object by menuId.
    this.addMenu = function(menuId, isPublic, roles) {
      // Create the new menu.
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles || this.defaultRoles,
        items: [],
        modalItems: [],
        hasAccess: hasAccess
      };

      return this.menus[menuId];
    };

    // Remove existing menu object by menuId.
    this.removeMenuById = function(menuId) {
      this.validateMenuExists(menuId);

      delete this.menus[menuId];
    };

    // Add a child menu item object to root menu.
    this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemClass,
                                menuItemState, menuItemUIRoute, isPublic, roles, position) {
      this.validateMenuExists(menuId);

      // Push new menu item to menu.
      this.menus[menuId].items.push({
        title: menuItemTitle,
        reference: menuItemURL,
        type: menuItemType || 'item',
        class: menuItemClass || menuItemType,
        state: menuItemState || menuItemTitle,
        uiRoute: menuItemUIRoute || menuItemURL,
        isPublic: (this.isNullOrUndefined(isPublic) ? this.menus[menuId].isPublic : isPublic),
        roles: (this.isNullOrUndefined(roles) ? this.menus[menuId].roles : roles),
        position: position || 0,
        items: [],
        hasAccess: hasAccess
      });

      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItemById = function(menuId, menuItemURL) {
      this.validateMenuExists(menuId);

      // Search for menu item to remove.
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      return this.menus[menuId];
    };

    // Add a child sub menu item object to menu item object.
    this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemState,
                                   menuItemUIRoute, isPublic, roles, position) {
      this.validateMenuExists(menuId);

      // Search for menu item.
      for (var itemIndex in this.menus[menuId].items) {
        // Push new sub menu item if menu item exists.
        if (this.menus[menuId].items[itemIndex].reference === rootMenuItemURL) {
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            reference: menuItemURL,
            state: menuItemState || menuItemTitle,
            uiRoute: menuItemUIRoute || menuItemURL,
            isPublic: (this.isNullOrUndefined(isPublic) ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
            roles: (this.isNullOrUndefined(isPublic) ? this.menus[menuId].items[itemIndex].roles : roles),
            position: position || 0,
            hasAccess: hasAccess
          });
        }
      }

      return this.menus[menuId];
    };

    // Remove existing sub menu object by sub menu URL.
    this.removeSubMenuItemByURL = function(menuId, submenuItemURL) {
      this.validateMenuExists(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      return this.menus[menuId];
    };
  }
]);
