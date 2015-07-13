'use strict';

// Module dependencies.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Issue Schema.
 */
var IssueSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Issue name',
    trim: true
  },
  language: {
    type: String,
    default: '',
    required: 'Language cannot be blank',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  padId: {
    type: String,
    default: ''
  },
  readOnlyPadId: {
    type: String,
    default: ''
  }
});

mongoose.model('Issue', IssueSchema);
