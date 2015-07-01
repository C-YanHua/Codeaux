'use strict';

// Module dependencies.
var ModelValidation = require('./validations/server.model.validations');
var ModelValidator = require('./validations/server.model.validator');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validators = {
  username: [
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.isUsernameMaxLength,
      message: ' is too long (maximum ' + ModelValidation.getUsernameMaxLength().toString() + ' characters)'
    },
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.hasNoIllegalUsernameChar,
      message: ' can only contain alphanumeric characters, hyphens and underscore'
    }
  ],
  email: [
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.isEmail,
      message: ' is invalid'
    }
  ],
  password: [
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.isPasswordMinLength,
      message: ' is too short (minimum ' + ModelValidation.getPasswordMinLength().toString() + ' characters)'
    },
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.isPasswordMaxLength,
      message: ' is too long (maximum ' + ModelValidation.getPasswordMaxLength().toString() + ' characters)'
    },
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.isAlpha,
      message: ' needs at least one alphabet letter'
    },
    {
      userPreCondition: ModelValidation.isLocal,
      validate: ModelValidation.isNumeric,
      message: ' needs at least one number'
    }
  ]
};

var validateUsername = function(username) {
  ModelValidator.setValidationErrorHeader('Username');

  return ModelValidator.validateValidatorsArray(username, validators.username, this);
};

var validateEmail = function(email) {
  ModelValidator.setValidationErrorHeader('Email');

  return ModelValidator.validateValidatorsArray(email, validators.email, this);
};

var validatePassword = function(password) {
  ModelValidator.setValidationErrorHeader('Password');

  return ModelValidator.validateValidatorsArray(password, validators.password, this);
};

// User Schema.
var UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    validate: [validateUsername, ModelValidator.validationErrorMessage()]
  },
  email: {
    type: String,
    trim: true,
    default: '',
    validate: [validateEmail, ModelValidator.validationErrorMessage()]
  },
  password: {
    type: String,
    default: '',
    validate: [validatePassword, ModelValidator.validationErrorMessage()]
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

  _this.findOne({
    username: possibleUsername
  }, function(err, user) {
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
