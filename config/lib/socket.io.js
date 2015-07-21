'use strict';

// Module dependencies.
var config = require('../config');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var http = require('http');
var https = require('https');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var socketio = require('socket.io');

var MongoStore = require('connect-mongo')(session);

/*
 * Initialize HTTP/HTTPS server and socket.io configurations.
 */
module.exports = function(app, db) {
  var server;
  if (config.secure === true) {
    // Load SSL key and certificate.
    var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
    var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');
    var options = {
      key: privateKey,
      cert: certificate
    };

    // Create new HTTPS server.
    server = https.createServer(options, app);
  } else {
    // Create new HTTP server.
    server = http.createServer(app);
  }

  // Create a new Socket.io server.
  var io = socketio.listen(server);

  // Create a MongoDB storage object.
  var mongoStore = new MongoStore({
    mongooseConnection: db.connection,
    collection: config.sessionCollection
  });

  // Intercept Socket.io's handshake request.
  io.use(function(socket, next) {
    // Use the 'cookie-parser' module to parse the request cookies.
    cookieParser(config.sessionSecret)(socket.request, {}, function() {
      // Get the session id from the request cookies.
      var sessionId = socket.request.signedCookies['connect.sid'];

      // Use the mongoStorage instance to get the Express session information.
      mongoStore.get(sessionId, function(err, session) {
        // Set the Socket.io session information.
        socket.request.session = session;

        // Use Passport to populate the user details.
        passport.initialize()(socket.request, {}, function() {
          passport.session()(socket.request, {}, function() {
            if (socket.request.user) {
              next(null, true);
            } else {
              next(new Error('User is not authenticated.'), false);
            }
          });
        });
      });
    });
  });

  // Add an event listener to the 'connection' event.
  io.on('connection', function(socket) {
    config.files.server.sockets.forEach(function(socketConfiguration) {
      require(path.resolve(socketConfiguration))(io, socket);
    });
  });

  return server;
};
