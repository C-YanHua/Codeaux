'use strict';

exports.isLowerCaseAlpha = function(word) {
  for (var i = 0; i < word.length; i++) {
    // [a-z] Lowercase alphabets character code.
    if (word.charCodeAt(i) > 96 && word.charCodeAt(i) < 123) {
      return true;
    }
  }

  return false;
};

exports.isUpperCaseAlpha = function(word) {
  for (var i = 0; i < word.length; i++) {
    // [A-Z] Uppercase alphabets character code.
    if (word.charCodeAt(i) > 64 && word.charCodeAt(i) < 91) {
      return true;
    }
  }

  return false;
};

exports.isAlpha = function(word) {
  return exports.isLowerCaseAlpha(word) || exports.isUpperCaseAlpha(word);
};

exports.isNumeric = function(word) {
  for (var i = 0; i < word.length; i++) {
    // [0-9] Numerals character code.
    if (word.charCodeAt(i) > 47 && word.charCodeAt(i) < 58) {
      return true;
    }
  }

  return false;
};

exports.isAlphaNumeric = function(word) {
  return exports.isAlpha(word) && exports.isNumeric(word);
};

exports.isLowerCaseAlphaNumeric = function(word) {
  return exports.isLowerCaseAlpha(word) && exports.isNumeric(word);
};

exports.isUpperCaseAlphaNumeric = function(word) {
  return exports.isUpperCaseAlpha(word) && exports.isNumeric(word);
};

exports.isEmpty = function(word) {
  return word === '' || word === null || word === undefined;
};

exports.isNotEmpty = function(word) {
  return word !== '' && word !== null && word !== undefined;
};
