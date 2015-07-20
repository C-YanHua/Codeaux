'use strict';

// Module dependencies.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Friend Request Schema.
 */
var FriendRequestSchema = new Schema({
  // Sender of friend request
  sender: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  // Receiver of friend request
  receiver: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  // 0=pending, 1=rejected, 2=accepted
  status : {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now
  },
  // Logs when the status of the request is changed
  updated: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('FriendRequest', FriendRequestSchema);
