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
  description: {
    type: String,
    default: '',
    required: 'Description cannot be blank',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  owner: {
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
  },
  // 0=false 1=true
  isPrivateIssue: {
    type: Number,
    default: 0
  }
});

mongoose.model('Issue', IssueSchema);
