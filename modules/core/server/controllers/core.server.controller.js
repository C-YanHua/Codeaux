'use strict';

/*
 * Render main application page.
 */
exports.renderIndex = function(req, res) {
  res.render('modules/core/server/views/index', {
    user: req.user || null
  });
};

/*
 * Sends error 403 forbidden to client side.
 * Client is expected to transit to 403 page.
 */
exports.sendForbidden = function(req, res) {
  return res.status(403).send();
};

/*
 * Sends error 404 page not found to client side.
 * Client is expected to transit to 404 page.
 */
exports.sendPageNotFound = function(req, res) {
  return res.status(404).send();
};

/*
 * Sends error 500 server internal error to client side.
 * Client is expected to transit to 500 page.
 */
exports.sendServerError = function(req, res) {
  res.status(500).send();
};
