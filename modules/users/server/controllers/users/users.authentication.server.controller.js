'use strict';

// Module dependencies.
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var passport = require('passport');
var path = require('path');

var errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var etherpad = require(path.resolve('./modules/issues/server/controllers/etherpad/etherpad.server.controller'));
var User = mongoose.model('User');

// Private function for sign up new OAuth or OpenID user.
var signupOAuthOrOpenId = function(searchQuery, possibleUsername, providerUserProfile, done) {
  async.waterfall([
    function(callback) {
      // Checks if OAuth user already exists.
      User.findOne(searchQuery, function(err, user) {
        if (err) {
          return done(errorHandler.getErrorResponse(2), user);
        } else if (user) {
          return done(null, user);
        } else {
          callback(null, user);
        }
      });
    },
    function(user, callback) {
      User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
        user = new User({
          name: providerUserProfile.name,
          username: availableUsername,
          email: providerUserProfile.email,
          imageUrl: providerUserProfile.imageUrl,
          provider: providerUserProfile.provider,
          providerData: providerUserProfile.providerData || providerUserProfile.providerIdentifierField,
          authorId: '',
          groupId: ''
        });

        callback(null, user);
      });
    },
    function(user, callback) {
      // Generate etherpad authorId for user.
      etherpad.generateAuthorId({name: user.username}, user, callback);
    },
    function(user, callback) {
      // Generate etherpad groupId for user.
      etherpad.generateGroupId(user, callback);
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

var requestSignin = function(req, res, user) {
  // Remove sensitive data before signin.
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

/*
 * Function to validate if properties parse when signing up are empty.
 * Returns error message for properties that are empty.
 */
var validateSignupEmpty = function(properties, errorMessage) {
  var message = {};

  for (var key in properties) {
    if (User.validateIsEmpty(properties[key])) {
      if (errorMessage) {
        message = _.merge(message, errorHandler.getErrorResponse(1000, key, errorMessage));
      } else {
        message = _.merge(message, errorHandler.getErrorResponse(1000, key));
      }
    }
  }

  return message;
};

/*
 * Function to validate if properties are unique (does not exist in database)
 * Only the following properties are to be validated: `username`, `email`.
 */
var validateSignupUnique = function(properties, message, errorMessage, callback) {
  // Properties that will be validated. Other properties will be ignored.
  var propertiesToValidate = ['username', 'email'];

  async.forEachOf(_.pick(properties, propertiesToValidate), function(value, key, next) {
    // Validate only if validation error does not already exist for that property.
    if (_.has(message.error, key)) {
      next(null);
    } else {
      User.validateIsUnique(undefined, key, value, function(isUnique) {
        if (!isUnique) {
          if (errorMessage) {
            message = _.merge(message, errorHandler.getErrorResponse(1001, key, errorMessage));
          } else {
            message = _.merge(message, errorHandler.getErrorResponse(1001, key));
          }
        }

        next(null);
      });
    }
  }, function() {
    callback(message);
  });
};

/*
 * Function to validate properties against database validators.
 */
var validateSignup = function(properties, user, message, errorMessage, callback) {
  user.validate(function(err) {
    if (err) {
      // Initialize message if message is empty.
      if (_.isEmpty(message)) {
        message = {
          message: '',
          error: {}
        };
      }

      message.message = (errorMessage) ? errorMessage : err.message;
      err = errorHandler.getCustomErrorResponse(err.message, err.errors);

      for (var key in properties) {
        // Only if validation error does not already exist and validation error occurred for that property.
        if (!_.has(message.error, key) && _.has(err.error, key)) {
          message.error[key] = err.error[key];
        }
      }
    }

    if (_.isEmpty(message)) {
      callback(null);
    } else {
      callback(message);
    }
  });
};

/*
 * Key event validation for user signup.
 * Validates only one property per function call.
 */
exports.validateSignupProperty = function(req, res) {
  var message = {};
  var property = req.body;
  var propertyKey = req.originalUrl.slice(req.originalUrl.lastIndexOf('/') + 1);

  // Initialize user object.
  var user = new User(req.body);
  user.provider = User.LOCAL_STRATEGY_PROVIDER;

  // Validate if property is empty.
  message = validateSignupEmpty(property);
  if (!_.isEmpty(message)) {
    return res.status(400).send(message);
  }

  async.waterfall([
    function(callback) {
      validateSignupUnique(property, message, undefined, function(err) {
        if (_.isEmpty(err)) {
          callback(null);
        } else {
          callback(errorHandler.getErrorResponse(1001, propertyKey));
        }
      });
    },
    function(callback) {
      validateSignup(property, user, message, undefined, callback);
    }
  ], function(err) {
    if (err) {
      return res.status(400).send(err);
    } else {
      return res.status(200).send();
    }
  });
};

/*
 * User signup function.
 */
exports.signup = function(req, res) {
  var message = {};
  var credentials = req.body;
  var genericErrorMessage = 'There were problems creating your account.';

  // Initialize user object.
  var user = new User(req.body);
  user.provider = User.LOCAL_STRATEGY_PROVIDER;

  // Validate if any of the credentials are empty.
  message = validateSignupEmpty(credentials, genericErrorMessage);

  // Throw error when all properties have validation error.
  if (_.every(_.keysIn(credentials), _.partial(_.has, message.error))) {
    return res.status(400).send(message);
  }

  async.waterfall([
    function(callback) {
      validateSignupUnique(credentials, message, genericErrorMessage, function(err) {
        // Throw error when all properties have validation error.
        if (_.every(_.keysIn(credentials), _.partial(_.has, message.error))) {
          callback(err);
        } else {
          callback(null);
        }
      });
    },
    function(callback) {
      validateSignup(credentials, user, message, genericErrorMessage, callback);
    },
    function(callback) {
      // Generate etherpad authorId for user.
      etherpad.generateAuthorId({name: user.username}, user, callback);
    },
    function(user, callback) {
      // Generate etherpad groupId for user.
      etherpad.generateGroupId(user, callback);
    },
    function(user, callback) {
      user.save(function(err) {
        // Error should never occur at this stage as credentials have already been validated.
        if (err) {
          callback(errorHandler.getErrorResponse(1));
        } else {
          requestSignin(req, res, user);
          callback(null);
        }
      });
    }
  ], function(err) {
    if (err) {
      return res.status(400).send(err);
    }
  });
};

/*
 * User signin function.
 */
exports.signin = function(req, res, next) {
  passport.authenticate(User.LOCAL_STRATEGY_PROVIDER, function(err, user) {
    if (err || !user) {
      res.status(400).send(errorHandler.getErrorResponse(503));
    } else {
      requestSignin(req, res, user);
    }
  })(req, res, next);
};

/*
 * User signout function.
 */
exports.signout = function(req, res) {
  // Delete etherpad session if found.
  if (req.cookies.sessionID) {
    etherpad.deleteSession({sessionID: req.cookies.sessionID});
  }

  req.logout();
  res.redirect('/');
};

/*
 * OpenId return function. (Similar to OAuth callback)
 */
exports.openIdReturn = function(strategy) {
  return this.oauthCallback(strategy);
};

/*
 * OAuth callback.
 */
exports.oauthCallback = function(strategy) {
  return function(req, res, next) {
    passport.authenticate(strategy, function(err, user, redirectUrl) {
      if (err || !user) {
        return res.redirect('/');
      }

      req.login(user, function(err) {
        if (err) {
          return res.redirect('/');
        }

        return res.redirect(redirectUrl || '/');
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
    return res.status(401).json(errorHandler.getErrorResponse(502));
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
      return res.status(400).send(errorHandler.getErrorResponse(800));
    } else {
      req.login(user, function(err) {
        if (err) {
          return res.status(400).send(errorHandler.getErrorResponse(800));
        } else {
          return res.json(user);
        }
      });
    }
  });
};
