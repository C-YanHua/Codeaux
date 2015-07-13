'use strict';

var mongoose = require('mongoose');
var path = require('path');

var PASSWORD_MIN_LENGTH = 8;
var PASSWORD_MAX_LENGTH = 128;
var USERNAME_MAX_LENGTH = 40;

var EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

exports.generics = require(path.resolve('./modules/core/server/validations/server.model.validations'));

exports.isValidUsername = function(str) {
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);

    // Allow character '-' and '_' in username.
    if (code !== 45 && code !== 95) {
      // If not an alphanumeric character. [a-zA-Z0-9]
      if (!(code > 47 && code < 58) && !(code > 64 && code < 91) && !(code > 96 && code < 123)) {
        return false;
      }
    }
  }

  return true;
};

exports.isUsernameMaxLength = function(str) {
  return str.length <= USERNAME_MAX_LENGTH;
};

exports.isPasswordMinLength = function(str) {
  return str.length >= PASSWORD_MIN_LENGTH;
};

exports.isPasswordMaxLength = function(str) {
  return str.length <= PASSWORD_MAX_LENGTH;
};

exports.isEmail = function(str) {
  return EMAIL_REGEX.test(str);
};

exports.isLocal = function(user) {
  return user.provider === mongoose.model('User').localStrategyProvider;
};

exports.propertyExistsInDatabase = function(property, callback) {
  var isValid = false;

  mongoose.model('User').findOne(property, function(error, user) {
    // If database throw error or user already exists.
    if (error || user) {
      isValid = true;
    }

    callback(isValid);
  });
};

exports.getUsernameMaxLength = function() {
  return USERNAME_MAX_LENGTH;
};

exports.getPasswordMinLength = function() {
  return PASSWORD_MIN_LENGTH;
};

exports.getPasswordMaxLength = function() {
  return PASSWORD_MAX_LENGTH;
};
