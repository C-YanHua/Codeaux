'use strict';

// Module dependencies.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Issue Schema.
 */
var IssueSchema = new Schema({
  // Issue details.
  owner: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: 'Please give a title for the issue.',
    trim: true
  },
  description: {
    type: String,
    required: 'Please give a description for the issue.',
    trim: true
  },
  tags: {
    type: Array,
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  },

  // Issue etherpad credentials.
  padId: {
    type: String,
    default: ''
  },
  readOnlyPadId: {
    type: String,
    default: ''
  },

  // Issue access control.
  isPrivate: {
    type: Number,
    min: 0, // 0 = false.
    max: 1, // 1 = true.
    default: 0
  },
  readOnly: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    default: []
  },
  readWrite: {
    type: [{
      type: Schema.ObjectId,
      ref: 'User'
    }],
    default: []
  }
});

mongoose.model('Issue', IssueSchema);
