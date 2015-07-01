'use strict';

// Module dependencies.
var async = require('async');
var errorHandler = require('../errors.server.controller');
var etherpad = require('../etherpad/etherpad.server.controller');
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');

// Private function for sign up new OAuth or OpenID user.
var signupOAuthOrOpenId = function(searchQuery, possibleUsername, providerUserProfile, done) {
  async.waterfall([
    function(callback) {
      User.findOne(searchQuery, function(error, user) {
        // If user already exists.
        if (user) {
          return done(error, user);
        }

        callback(error, user);
      });
    },
    function(user, callback) {
      User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
        user = new User({
          firstName: providerUserProfile.firstName,
          lastName: providerUserProfile.lastName,
          username: availableUsername,
          displayName: providerUserProfile.displayName,
          email: providerUserProfile.email,
          provider: providerUserProfile.provider,
          providerData: providerUserProfile.providerData || providerUserProfile.providerIdentifierField,
          authorId: '',
          groupId: ''
        });

        callback(null, user);
      });
    },
    function(user, callback) {
      // Generate etherpad authorID for user.
      etherpad.createAuthor({name: user.username}, user, callback);
    },
    function(user, callback) {
      // Generate etherpad Group for user.
      etherpad.createGroup(user, callback);
    },
    function(user, callback) {
      user.save(function(error) {
        return done(error, user);
      });

      callback(null);
    }
  ], function(error) {
    if (error) {
      return done(error);
    }
  });
};

// Private function to merge provider data with existing logged in user.
var mergeOAuthOrOpenIDProvider = function(user, providerUserProfile, done) {
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
    user.save(function(error) {
      return done(error, user, 'settings/accounts');
    });
  } else {
    return done(new Error('User is already connected using this provider'), user);
  }
};

var requestSignIn = function(req, res, user) {
  // Remove sensitive data before login.
  user.password = undefined;
  user.salt = undefined;

  req.login(user, function(error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.json(user);
    }
  });
};

// For use in real-time validation for user sign up.
exports.signupValidation = function(req, res) {
  var errorMessage = null;
  var property = null;

  if (Object.keys(req.body).length) {
    var userToValidate = new User(req.body);
    userToValidate.provider = User.localStrategyProvider;

    var propertyToValidate = req.originalUrl.substring(req.originalUrl.lastIndexOf('/') + 1);
    switch (propertyToValidate) {
      case 'username':
        property = {username: userToValidate.username};
        break;
      case 'email':
        property = {email: userToValidate.email};
        break;
    }

    User.findOne(property, function(error, user) {
      if (property) {
        if (error || user) {
          errorMessage = propertyToValidate.charAt(0).toUpperCase() + propertyToValidate.slice(1);
          errorMessage += ' is already taken';

          return res.status(400).send({
            message: errorMessage
          });
        }
      }

      userToValidate.validate(function(error) {
        if (error) {
          switch (propertyToValidate) {
            case 'username':
              if (error.errors.username) {
                errorMessage = error.errors.username.message;
              }
              break;
            case 'email':
              if (error.errors.email) {
                errorMessage = error.errors.email.message;
              }
              break;
            case 'password':
              if (error.errors.password) {
                errorMessage = error.errors.password.message;
              }
              break;
          }

          if (errorMessage) {
            return res.status(400).send({
              message: errorMessage
            });
          } else {
            return res.status(200).send();
          }
        } else {
          return res.status(200).send();
        }
      });
    });
  }
};

// New user sign up.
exports.signup = function(req, res) {
  // For security measurement we remove the roles from the req.body object.
  delete req.body.roles;

  // Init Variables.
  var user = new User(req.body);

  // Add missing user fields
  user.provider = User.localStrategyProvider;
  user.displayName = user.firstName + ' ' + user.lastName;

  async.waterfall([
    function(user, callback) {
      // Generate etherpad authorID for user.
      etherpad.createAuthor({name: user.username}, user, callback);
    },
    function(user, callback) {
      // Generate etherpad Group for user.
      etherpad.createGroup(user, callback);
    },
    function(user, callback) {
      user.save(function(error) {
        if (!error) {
          requestSignIn(req, res, user);
        }

        callback(error);
      });
    }
  ], function(error) {
    if (error) {
      return res.status(400).send(error);
    }
  });
};

// User sign in, either after passport authentication or local.
exports.signin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      requestSignIn(req, res, user);
    }
  })(req, res, next);
};

// User sign out.
exports.signout = function(req, res) {
  // Delete etherpad session if found.
  if (req.cookies.sessionID) {
    etherpad.deleteSession({sessionID: req.cookies.sessionID});
  }

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
      providerData: providerUserProfile.providerIdentifierField
    };
    var possibleUsername = providerUserProfile.username || providerUserProfile.email;

    return signupOAuthOrOpenId(searchQuery, possibleUsername, providerUserProfile, done);

  } else {
    // User is already logged in, join the provider data to the existing user
    return mergeOAuthOrOpenIDProvider(req.user, providerUserProfile, done);
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
    return mergeOAuthOrOpenIDProvider(req.user, providerUserProfile, done);
  }
};

// Remove OAuth provider.
exports.removeOAuthProvider = function(req, res) {
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
