'use strict';

// Module dependencies.
var crypto = require('crypto');
var mongoose = require('mongoose');

var userModelValidation = require('../validations/user.server.model.validations');
var userModelValidator = require('../validations/user.server.model.validator');
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

var validateIsNotEmpty = function(property, header) {
  if (userModelValidation.generics.isNotEmpty(property)) {
    return true;
  } else {
    userModelValidator.setValidationErrorsHeader(header);
    userModelValidator.setValidationErrors(' cannot be blank');
    return false;
  }
};

var validateUsername = function(username, callback) {
  var usernameHeader = 'Username';
  var _this = this;

  if (validateIsNotEmpty(username, usernameHeader)) {
    return userModelValidation.propertyExistsInDatabase({username: username}, function(isValid) {
      userModelValidator.setValidationErrorsHeader(usernameHeader);

      if (isValid) {
        userModelValidator.setValidationErrors(' is already taken');
        callback(!isValid);
      }

      callback(userModelValidator.validateValidatorsArray(username, validators.username, _this));
    });
  } else {
    callback(false);
  }
};

var validateEmail = function(email, callback) {
  var emailHeader = 'Email';
  var _this = this;

  if (validateIsNotEmpty(email, emailHeader)) {
    return userModelValidation.propertyExistsInDatabase({email: email}, function(isValid) {
      userModelValidator.setValidationErrorsHeader(emailHeader);

      if (isValid) {
        userModelValidator.setValidationErrors(' is already taken');
        callback(!isValid);
      }

      callback(userModelValidator.validateValidatorsArray(email, validators.email, _this));
    });
  } else {
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
  name: {
    type: String,
    trim: true,
    default: ''
  },
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
  profileImageUrl: {
    type: String,
    default: 'modules/users/img/profile/default.png'
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
  },
  // For list of friends
  friends: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    default: []
  }
});

// Hook a pre-save method to hash the password.
UserSchema.pre('save', function(next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

// Method for hashing password.
UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
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
