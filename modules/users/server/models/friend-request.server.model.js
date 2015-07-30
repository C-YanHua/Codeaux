'use strict';

// Module dependencies.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 * Friend Request Schema.
 */
var FriendRequestSchema = new Schema({
  // User who initiated the friend request.
  requester: {
    type: Schema.ObjectId,
    ref: 'User'
  },

  // User at the receiving end of the friend request.
  receiver: {
    type: Schema.ObjectId,
    ref: 'User'
  },

  status : {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    trim: true,
    default: 'pending'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('FriendRequest', FriendRequestSchema);
