'use strict';

// Module dependencies.
var async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var etherpad = require(path.resolve('./modules/core/server/controllers/etherpad/etherpad.server.controller'));
var User = mongoose.model('User');

// Private function for sign up new OAuth or OpenID user.
var signupOAuthOrOpenId = function(searchQuery, possibleUsername, providerUserProfile, done) {
  async.waterfall([
    function(callback) {
      User.findOne(searchQuery, function(err, user) {
        // If user already exists.
        if (user) {
          return done(err, user);
        }

        callback(err, user);
      });
    },
    function(user, callback) {
      User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
        user = new User({
          name: providerUserProfile.name,
          username: availableUsername,
          email: providerUserProfile.email,
          profileImageUrl: providerUserProfile.profileImageUrl,
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
      user.save(function(err) {
        return done(err, user);
      });

      callback(null);
    }
  ], function(err) {
    if (err) {
      return done(err);
    }
  });
};

// Private function to merge provider data with existing logged in user.
var mergeOAuthOrOpenIDProvider = function(user, providerUserProfile, done) {
  // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured.
  if (user.provider !== providerUserProfile.provider &&
     (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
    // Add the provider data to the additional provider data field
    if (!user.additionalProvidersData) {
      user.additionalProvidersData = {};
    }
    user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

    // Tell mongoose that we've updated the additionalProvidersData field.
    user.markModified('additionalProvidersData');

    // And save the user
    user.save(function(err) {
      return done(err, user, '/settings/accounts');
    });
  } else {
    return done(new Error('User is already connected using this provider'), user);
  }
};

var requestSignIn = function(req, res, user) {
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
};

// For use in real-time validation for user sign up.
exports.signupValidation = function(req, res) {
  var user = new User(req.body);
  user.provider = User.localStrategyProvider;

  var propertyToValidate = req.originalUrl.substring(req.originalUrl.lastIndexOf('/') + 1);
  user.validate(function(error) {
    if (error) {
      return res.status(400).send({
        errorMessage: error.errors[propertyToValidate].message
      });
    }

    return res.status(200).send();
  });
};

// New user sign up.
exports.signup = function(req, res) {
  // For security measurement we remove the roles from the req.body object.
  delete req.body.roles;
  // Init Variables.
  var user = new User(req.body);

  // Add missing user fields.
  user.provider = User.localStrategyProvider;

  async.waterfall([
    function(callback) {
      // Generate etherpad authorID for user.
      etherpad.createAuthor({name: user.username}, user, callback);
    },
    function(user, callback) {
      // Generate etherpad Group for user.
      etherpad.createGroup(user, callback);
    },
    function(user, callback) {
      user.save(function(err) {
        if (!err) {
          requestSignIn(req, res, user);
        }

        callback(err);
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).send({
        errorMessage: 'There were problems creating your account.',
        error: err.errors
      });
    }
  });
};

// User sign in, either after passport authentication or local.
exports.signin = function(req, res, next) {
  passport.authenticate(User.localStrategyProvider, function(error, user) {
    if (error || !user) {
      res.status(400).send({
        message: 'Invalid username or password.'
      });
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
        return res.redirect('/');
      }

      req.login(user, function(err) {
        if (err) {
          return res.redirect('/');
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
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  }

  if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider.
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Tell mongoose that we've updated the additionalProvidersData field.
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
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};
