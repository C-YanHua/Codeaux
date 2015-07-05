'use strict';

exports.isLowerCaseAlpha = function(str) {
  for (var i = 0; i < str.length; i++) {
    // [a-z] Lowercase alphabets character code.
    if (str.charCodeAt(i) > 96 && str.charCodeAt(i) < 123) {
      return true;
    }
  }

  return false;
};

exports.isUpperCaseAlpha = function(str) {
  for (var i = 0; i < str.length; i++) {
    // [A-Z] Uppercase alphabets character code.
    if (str.charCodeAt(i) > 64 && str.charCodeAt(i) < 91) {
      return true;
    }
  }

  return false;
};

exports.isAlpha = function(str) {
  return exports.isLowerCaseAlpha(str) || exports.isUpperCaseAlpha(str);
};

exports.isNumeric = function(str) {
  for (var i = 0; i < str.length; i++) {
    // [0-9] Numerals character code.
    if (str.charCodeAt(i) > 47 && str.charCodeAt(i) < 58) {
      return true;
    }
  }

  return false;
};

exports.isAlphaNumeric = function(str) {
  return exports.isAlpha(str) && exports.isNumeric(str);
};

exports.isLowerCaseAlphaNumeric = function(str) {
  return exports.isLowerCaseAlpha(str) && exports.isNumeric(str);
};

exports.isUpperCaseAlphaNumeric = function(str) {
  return exports.isUpperCaseAlpha(str) && exports.isNumeric(str);
};

exports.isNotEmpty = function(str) {
  return str !== '' && str !== null && str !== undefined;
};
