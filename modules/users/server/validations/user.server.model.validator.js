'use strict';

var ERROR_MESSAGE_DELIMITER = ', ';
var ERROR_MESSAGE_END_DELIMITER = ' and ';

var validationErrors = [];
var validationErrorsHeader = '';
var validationErrorsTail = '.';

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
  validationMessage += validationErrorsTail;

  // Refresh error message.
  validationErrors = [];

  return validationMessage;
};

exports.validateValidatorsArray = function(value, validators, userSchema) {
  var isValid = true;

  validators.forEach(function(validator) {
    var preConditionsMet = true;

    if ('userPreCondition' in validator) {
      preConditionsMet = validator.userPreCondition(userSchema);
    }

    if (preConditionsMet && 'validatorPreCondition' in validator) {
      preConditionsMet = validator.validatorPreCondition(value);
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

exports.validationErrorsMessage = function() {
  return {message: new ValidationErrorRetriever()};
};

exports.setValidationErrors = function(message) {
  validationErrors.push(message);
};

exports.setValidationErrorsHeader = function(header) {
  validationErrorsHeader = header;
};

exports.setValidationErrorsTail = function(tail) {
  validationErrorsTail = tail;
};
