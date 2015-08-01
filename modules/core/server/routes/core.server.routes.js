'use strict';

/*
 * Core routing.
 */
module.exports = function(app) {
  var core = require('../controllers/core.server.controller');

  // Define HTTP error pages. (This will not work if user were to directly type in express route in the url.)
  app.route('/403-forbidden').get(core.sendForbidden);
  app.route('/404-page-not-found').get(core.sendPageNotFound);
  app.route('/500-server-error').get(core.sendServerError);

  // Return page not found error for all undefined api, module or lib routes.
  app.route('/:url(api|modules|lib)/*').get(core.sendPageNotFound);

  // Define application route.
  app.route('/*').get(core.renderIndex);
};
