'use strict';

var ERROR_MESSAGES = {
  APPLICATION_ERROR: {
    CODE: 1,
    MESSAGE: 'Application error.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  DATABASE_ERROR: {
    CODE: 2,
    MESSAGE: 'Database error.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  ETHERPAD_ERROR: {
    CODE: 3,
    MESSAGE: 'Etherpad server error.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  USER_EXIST_ERROR: {
    CODE: 500,
    MESSAGE: 'User already exists in database.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  USER_NOT_EXIST_ERROR: {
    CODE: 501,
    MESSAGE: 'User does not exists in database.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  USER_NOT_AUTHENTICATED_ERROR: {
    CODE: 502,
    MESSAGE: 'User is not sign in.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  USER_SIGNIN_ERROR: {
    CODE: 503,
    MESSAGE: 'Invalid username or password.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  OAUTH_SIGNUP_ERROR: {
    CODE: 800,
    MESSAGE: 'OAuth signup failed.',
    SUB_MESSAGE: '',
    SUB_MESSAGE_RELATIVE: false
  },
  EMPTY_VALUE_ERROR: {
    CODE: 1000,
    MESSAGE: 'Property validated is empty.',
    SUB_MESSAGE: 'cannot be blank.',
    SUB_MESSAGE_RELATIVE: true
  },
  UNIQUE_VALUE_ERROR: {
    CODE: 1001,
    MESSAGE: 'Property validated is not unique.',
    SUB_MESSAGE: 'is already taken.',
    SUB_MESSAGE_RELATIVE: true
  }
};

/*
 * Retrieve error message by code.
 */
var getErrorMessageByCode = function(code) {
  for (var i in ERROR_MESSAGES) {
    if (ERROR_MESSAGES[i].CODE === code) {
      return ERROR_MESSAGES[i];
    }
  }

  return null;
};

/*
 * Function to format message.
 */
var formatMessage = function(messageArray) {
  var message = '';
  for (var i = 0; i < messageArray.length; i++) {
    message += messageArray[i] + ' ';
  }

  message.trim();
  return message.charAt(0).toUpperCase() + message.slice(1);
};

/*
 * Function to setup error response to client side.
 */
exports.getErrorResponse = function(code, propertyKey, message) {
  var errorMessage = getErrorMessageByCode(code);
  var response = {
    message: '',
    error: {}
  };

  if (errorMessage) {
    // Use default error message if custom message undefined.
    if (message) {
      response.message = message;
    } else {
      response.message = errorMessage.MESSAGE;
    }

    if (propertyKey) {
      if (errorMessage.SUB_MESSAGE_RELATIVE) {
        response.error[propertyKey] = formatMessage([propertyKey, errorMessage.SUB_MESSAGE]);
      } else {
        response.error[propertyKey] = errorMessage.SUB_MESSAGE;
      }
    }
  }

  return response;
};

/*
 * Function to setup custom error response to client side.
 */
exports.getCustomErrorResponse = function(message, errors) {
  var response = {
    message: '',
    error: {}
  };

  response.message = message;

  for (var propertyKey in errors) {
    response.error[propertyKey] = errors[propertyKey].message;
  }

  return response;
};
