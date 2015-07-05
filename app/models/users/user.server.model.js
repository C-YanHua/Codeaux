'use strict';

// Module dependencies.
var crypto = require('crypto');
var userModelValidation = require('./user.server.model.validations');
var userModelValidator = require('./user.server.model.validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validators = {
  username: [
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.isUsernameMaxLength,
      message: ' is too long (maximum ' + userModelValidation.getUsernameMaxLength().toString() + ' characters)'
    },
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.isValidUsername,
      message: ' can only contain alphanumeric characters, hyphens and underscores'
    }
  ],
  email: [
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.isEmail,
      message: ' is invalid'
    }
  ],
  password: [
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.isPasswordMinLength,
      message: ' is too short (minimum ' + userModelValidation.getPasswordMinLength().toString() + ' characters)'
    },
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.isPasswordMaxLength,
      message: ' is too long (maximum ' + userModelValidation.getPasswordMaxLength().toString() + ' characters)'
    },
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.generics.isAlpha,
      message: ' needs at least one alphabet letter'
    },
    {
      userPreCondition: userModelValidation.isLocal,
      validate: userModelValidation.generics.isNumeric,
      message: ' needs at least one number'
    }
  ]
};

var validateUsername = function(username, callback) {
  var _this = this;

  if (userModelValidation.generics.isNotEmpty(username)) {
    return userModelValidation.propertyExistsInDatabase({username: username}, function(isValid) {
      userModelValidator.setValidationErrorsHeader('Username');

      if (isValid) {
        userModelValidator.setValidationErrors(' is already taken');
        callback(!isValid);
      }

      callback(userModelValidator.validateValidatorsArray(username, validators.username, _this));
    });

  } else {
    userModelValidator.setValidationErrorsHeader('Username');
    userModelValidator.setValidationErrors(' cannot be blank');
    callback(false);
  }
};

var validateEmail = function(email, callback) {
  var _this = this;

  if (userModelValidation.generics.isNotEmpty(email)) {
    return userModelValidation.propertyExistsInDatabase({email: email}, function(isValid) {
      userModelValidator.setValidationErrorsHeader('Email');

      if (isValid) {
        userModelValidator.setValidationErrors(' is already taken');
        callback(!isValid);
      }

      callback(userModelValidator.validateValidatorsArray(email, validators.email, _this));
    });

  } else {
    userModelValidator.setValidationErrorsHeader('Email');
    userModelValidator.setValidationErrors(' cannot be blank');
    callback(false);
  }
};

var validatePassword = function(password) {
  userModelValidator.setValidationErrorsHeader('Password');

  if (userModelValidation.generics.isNotEmpty(password)) {
    return userModelValidator.validateValidatorsArray(password, validators.password, this);
  }

  userModelValidator.setValidationErrors(' cannot be blank');
  return false;
};

// User Schema.
var UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    validate: [validateUsername, userModelValidator.validationErrorsMessage()]
  },
  email: {
    type: String,
    trim: true,
    validate: [validateEmail, userModelValidator.validationErrorsMessage()]
  },
  password: {
    type: String,
    validate: [validatePassword, userModelValidator.validationErrorsMessage()]
  },
  salt: {
    type: String
  },

  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  displayName: {
    type: String,
    trim: true
  },
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
  /* For reset password */
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  // For etherpad
  authorId: {
    type: String,
    default: ''
  },
  groupId: {
    type: String,
    default: ''
  }
});

// Hook a pre-save method to hash the password.
UserSchema.pre('save', function(next) {
  if (this.password && this.password.length > 6) {
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

// Method for hashing password.
UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

// Method for authenticating user.
UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

// Generate unique username if username already exists. (mainly used for OAuth, will change in the future)
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
  var _this = this;
  var possibleUsername = username + (suffix || '');

  _this.findOne({username: possibleUsername}, function(err, user) {
    if (!err) {
      if (!user) {
        callback(possibleUsername);
      } else {
        return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
      }
    } else {
      callback(null);
    }
  });
};

// Static variables.
UserSchema.statics.localStrategyProvider = 'local';

mongoose.model('User', UserSchema);
