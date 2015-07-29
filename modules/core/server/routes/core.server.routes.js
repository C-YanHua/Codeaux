'use strict';

/*
 * Core routing.
 */
module.exports = function(app) {
  var core = require('../controllers/core.server.controller');

  // Define HTTP error pages.
  app.route('/500-server-error').get(core.sendServerError);
  app.route('/404-page-not-found').get(core.sendPageNotFound);

  // Return page not found error for all undefined api, module or lib routes.
  app.route('/:url(api|modules|lib)/*').get(core.sendPageNotFound);

  // Define application route.
  app.route('/*').get(core.renderIndex);
};
