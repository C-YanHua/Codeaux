'use strict';

// Module dependencies.
var errorHandler = require('../errors.server.controller');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

var async = require('async');
var etherpadApi = require('etherpad-lite-client');

// the apikey is found when installing etherpad locally
var etherpad = etherpadApi.connect({
  apikey: '96a331ca0a3f728fe38308ac25c75d7bbef29d22f611b365f861d947f0869140',
  host: 'localhost',
  port: 9001
});


// Private function for sign up new OAuth or OpenID user.
var signupOAuthOrOpenId = function(searchQuery, possibleUsername, providerUserProfile, done) {
  User.findOne(searchQuery, function(err, user) {
    if (err) {
      return done(err);
    } else {
      if (!user) {
        User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
          user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            username: availableUsername,
            displayName: providerUserProfile.displayName,
            email: providerUserProfile.email,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData
          });

          // And save the user
          user.save(function(err) {
            return done(err, user);
          });
        });
      } else {
        return done(err, user);
      }
    }
  });
};

// Private function to merge provider data with existing logged in user.
var mergeOAuthOrOpenIDProvider = function(req, providerUserProfile, done) {
  // User is already logged in, join the provider data to the existing user
  var user = req.user;

  // Check if user exists, is not signed in using this provider,
  // and doesn't have that provider data already configured.
  if (user.provider !== providerUserProfile.provider &&
      (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
    // Add the provider data to the additional provider data field
    if (!user.additionalProvidersData) {
      user.additionalProvidersData = {};
    }

    user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');

    // And save the user
    user.save(function(err) {
      return done(err, user, 'settings/accounts');
    });
  } else {
    return done(new Error('User is already connected using this provider'), user);
  }
};

// New user sign up.
exports.signup = function(req, res) {
  async.waterfall([
    function(callback) {
      // For security measurement we remove the roles from the req.body object.
      delete req.body.roles;

      // Init Variables.
      var user = new User(req.body);
      var message = null;

      // Add missing user fields
      user.provider = 'local';
      user.displayName = user.firstName + ' ' + user.lastName;

      // Generate etherpad authorID
      var args = {};
      args["name"] = user.username;
      etherpad.createAuthor(args, function(error, data) {
        if (error) {
          var err = error.message;
        } else {
          user.authorId = data.authorID;
        }
        callback(err, user);
      });
    },
    function(user, callback) {
      etherpad.createGroup(function(error, data) {
        if (error) {
          var err = error.message;
        } else {
          user.groupId = data.groupID;
        }
        callback(err, user);
      });
    },
    function(user, callback) {
      // Then save the user
      user.save(function(error) {
        if (error) {
          var err = {message: errorHandler.getErrorMessage(error)};
        } else {
          // Remove sensitive data before login
          user.password = undefined;
          user.salt = undefined;

          req.login(user, function(err) {
            if (!err) {
              res.json(user);
            }
          });
        }
        callback(err);
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).send(err);
    }
  });
};

// User sign in, either after passport authentication or local.
exports.signin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      // Remove sensitive data before login.
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

// User sign out.
exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

// OpenID Return (Same implementation as OAuth Callback).
exports.openIdReturn = function(strategy) {
  return this.oauthCallback(strategy);
};

// OAuth callback.
exports.oauthCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user, redirectURL) {
      if (err || !user) {
        return res.redirect('signin');
      }
      req.login(user, function(err) {
        if (err) {
          return res.redirect('signin');
        }

        return res.redirect(redirectURL || '/');
      });
    })(req, res, next);
  };
};

// Helper function to save or update a OpenID user profile.
exports.saveOpenIdUserProfile = function(req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query to find existing user with current provider profile.
    var searchQuery = {
      provider: providerUserProfile.providerIdentifierField
    };

    var possibleUsername = providerUserProfile.username || providerUserProfile.email;

    return signupOAuthOrOpenId(searchQuery, possibleUsername, providerUserProfile, done);
  } else {

    return mergeOAuthOrOpenIDProvider(req, providerUserProfile, done);
  }
};

// Helper function to save or update a OAuth user profile.
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields.
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider +
                                                  '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query.
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] =
      providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query.
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] =
      providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile.
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    var possibleUsername = providerUserProfile.username || providerUserProfile.email;

    return signupOAuthOrOpenId(searchQuery, possibleUsername, providerUserProfile, done);
  } else {

    return mergeOAuthOrOpenIDProvider(req, providerUserProfile, done);
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
  var user = req.user;
  var provider = req.param('provider');

  if (user && provider) {
    // Delete the additional provider
    if (user.additionalProvidersData[provider]) {
      delete user.additionalProvidersData[provider];

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');
    }

    user.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  }
};
