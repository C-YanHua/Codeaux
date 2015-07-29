'use strict';

// Module dependencies.
var crypto = require('crypto');
var mongoose = require('mongoose');

var userValidation = require('../validations/users.server.validations');
var userValidator = require('../validations/users.server.validator');
var Schema = mongoose.Schema;

var validators = {
  username: [
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.isUsernameMaxLength,
      message: ' is too long (maximum ' + userValidation.getUsernameMaxLength().toString() + ' characters)'
    },
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.isValidUsername,
      message: ' can only contain alphanumeric characters, hyphens and underscores'
    }
  ],
  email: [
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.isEmail,
      message: ' is invalid'
    }
  ],
  password: [
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.isPasswordMinLength,
      message: ' is too short (minimum ' + userValidation.getPasswordMinLength().toString() + ' characters)'
    },
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.isPasswordMaxLength,
      message: ' is too long (maximum ' + userValidation.getPasswordMaxLength().toString() + ' characters)'
    },
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.generics.isAlpha,
      message: ' needs at least one alphabet letter'
    },
    {
      userPreCondition: userValidation.isLocal,
      validate: userValidation.generics.isNumeric,
      message: ' needs at least one number'
    }
  ]
};

/*
 * Custom validator for validation of username property.
 */
var usernameValidator = function(username, callback) {
  userValidator.setValidationErrorsHeader('Username');
  console.log('reach');
  callback(userValidator.validateValidatorsArray(username, validators.username, this));
};

/*
 * Custom validator for validation of email property.
 */
var emailValidator = function(email, callback) {
  userValidator.setValidationErrorsHeader('Email');

  callback(userValidator.validateValidatorsArray(email, validators.email, this));
};

/*
 * Custom validator for validation of password property.
 */
var passwordValidator = function(password) {
  userValidator.setValidationErrorsHeader('Password');

  return userValidator.validateValidatorsArray(password, validators.password, this);
};

/*
 * User Database Schema.
 */
var UserSchema = new Schema({
  // User credentials.
  username: {
    type: String,
    trim: true,
    validate: [usernameValidator, userValidator.validationErrorsMessage()]
  },
  email: {
    type: String,
    trim: true,
    validate: [emailValidator, userValidator.validationErrorsMessage()]
  },
  password: {
    type: String,
    validate: [passwordValidator, userValidator.validationErrorsMessage()]
  },
  salt: {
    type: String
  },

  // User details.
  name: {
    type: String,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    default: 'modules/users/img/profile/default.png'
  },
  link: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  friends: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },

  // User etherpad credentials.
  authorId: {
    type: String,
    default: ''
  },
  groupId: {
    type: String,
    default: ''
  },

  // User access control.
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin']
    }],
    default: ['user']
  },

  // User OAuth information.
  provider: {
    type: String,
    required: 'Provider is required'
  },
  providerData: {},
  additionalProvidersData: {},

  // User password reset.
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
});

/*
 * Set a pre hook on `save` method.
 */
UserSchema.pre('save', function(callback) {
  // Hashing of password before creating/updating user.
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  callback();
});

/*
 * Function for hashing password.
 */
UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/*
 * Function for authenticating user's password.
 */
UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

/*
 * Function for validating if property value is empty.
 */
UserSchema.statics.validateIsEmpty = function(value) {
  return userValidation.generics.isEmpty(value);
};

/*
 * Function for validating if property is unique in schema.
 */
UserSchema.statics.validateIsUnique = function(userId, key, value, callback) {
  var property = {};
  property[key] = value;

  var isUnique = true;
  this.findOne(property, function(err, user) {
    if (err) {
      isUnique = false;
    } else {
      if (user) {
        if (!userId || user._id !== userId) {
          isUnique = false;
        }
      }
    }

    callback(isUnique);
  });
};

/*
 * Generate unique username if username already exists.
 */
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
UserSchema.statics.LOCAL_STRATEGY_PROVIDER = 'local';

mongoose.model('User', UserSchema);
