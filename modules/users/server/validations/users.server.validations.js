'use strict';

var mongoose = require('mongoose');
var path = require('path');

var PASSWORD_MIN_LENGTH = 8;
var PASSWORD_MAX_LENGTH = 128;
var USERNAME_MAX_LENGTH = 40;

var EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

exports.generics = require(path.resolve('./modules/core/server/validations/core.server.validations'));

exports.isValidUsername = function(username) {
  for (var i = 0; i < username.length; i++) {
    var code = username.charCodeAt(i);

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

exports.isUsernameMaxLength = function(username) {
  return username.length <= USERNAME_MAX_LENGTH;
};

exports.isPasswordMinLength = function(password) {
  return password.length >= PASSWORD_MIN_LENGTH;
};

exports.isPasswordMaxLength = function(password) {
  return password.length <= PASSWORD_MAX_LENGTH;
};

exports.isEmail = function(email) {
  return EMAIL_REGEX.test(email);
};

exports.isLocal = function(user) {
  return user.provider === mongoose.model('User').LOCAL_STRATEGY_PROVIDER;
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
