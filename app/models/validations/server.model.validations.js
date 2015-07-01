'use strict';

var mongoose = require('mongoose');

var USERNAME_MAX_LENGTH = 40;
var PASSWORD_MIN_LENGTH = 8;
var PASSWORD_MAX_LENGTH = 128;

var EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

exports.hasNoIllegalUsernameChar = function(str) {
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
  return (str.length <= USERNAME_MAX_LENGTH);
};

exports.isPasswordMinLength = function(str) {
  return (str.length >= PASSWORD_MIN_LENGTH);
};

exports.isPasswordMaxLength = function(str) {
  return (str.length <= PASSWORD_MAX_LENGTH);
};

exports.isEmail = function(str) {
  return EMAIL_REGEX.test(str);
};

exports.isNumeric = function(str) {
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);

    // [0-9] Numerals character code.
    if (code > 47 && code < 58) {
      return true;
    }
  }

  return false;
};

exports.isLowerCaseAlpha = function(str) {
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);

    // [a-z] Lowercase alphabets character code.
    if (code > 96 && code < 123) {
      return true;
    }
  }

  return false;
};

exports.isUpperCaseAlpha = function(str) {
  for (var i = 0; i < str.length; i++) {
    var code = str.charCodeAt(i);

    // [A-Z] Uppercase alphabets character code.
    if (code > 64 && code < 91) {
      return true;
    }
  }

  return false;
};

exports.isAlpha = function(str) {
  return (exports.isLowerCaseAlpha(str) || exports.isUpperCaseAlpha(str));
};

exports.isAlphaNumeric = function(str) {
  return (exports.isAlpha(str) && exports.isNumeric(str));
};

exports.isLowerCaseAlphaNumeric = function(str) {
  return (exports.isLowerCaseAlpha(str) && exports.isNumeric(str));
};

exports.isUpperCaseAlphaNumeric = function(str) {
  return (exports.isUpperCaseAlpha(str) && exports.isNumeric(str));
};

exports.isLocal = function(user) {
  return user.provider === mongoose.model('User').localStrategyProvider;
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
