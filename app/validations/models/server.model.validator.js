'use strict';

var ERROR_MESSAGE_DELIMITER = ', ';
var ERROR_MESSAGE_END_DELIMITER = ' and ';

var validationErrorsHeader = null;
var validationErrors = [];

function ValidationErrorRetriever() {}

ValidationErrorRetriever.prototype.replace = function(regexp, substr) {
  var validationMessage = validationErrorsHeader;

  for (var i = 0; i < validationErrors.length; i++) {
    validationMessage += validationErrors[i].replace(regexp, substr);

    // Delimit the messages stored in the array.
    if (i + 2 === validationErrors.length) {
      validationMessage += ERROR_MESSAGE_END_DELIMITER;

    // Replace last delimiter.
    } else if (i + 1 !== validationErrors.length) {
      validationMessage += ERROR_MESSAGE_DELIMITER;
    }
  }

  // Refresh error message.
  validationErrors = [];

  return validationMessage;
};

exports.validateValidatorsArray = function(value, validators, userSchema) {
  var isValid = true;

  validators.forEach(function(validator) {
    var preConditionsMet = true;

    // Ignore pre-conditions if they do not exist.
    if ('userPreCondition' in validator && 'validatorPreCondition' in validator) {
      preConditionsMet = validator.userPreCondition(userSchema) && validator.validatorPreCondition(value);
    }

    // Only validate if pre-conditions are met.
    if (preConditionsMet && !validator.validate(value)) {
      isValid = false;

      // Append error message.
      validationErrors.push(validator.message);
    }
  });

  return isValid;
};

exports.validationErrorMessage = function() {
  return {message: new ValidationErrorRetriever()};
};

exports.setValidationErrorHeader = function(header) {
  validationErrorsHeader = header;
};
