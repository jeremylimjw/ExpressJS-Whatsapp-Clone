const mongoose = require('mongoose');
const mongodb = require("mongodb")

const TEXT_LIMIT = 20;

const channelSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    ownerId: { 
      type: String, 
      required: true,
    },
    participants: {
      type: [
        {
          userId: { type: String, required: true },
          lastReceived: { type: Date, default: Date.now },
          lastRead: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    messages: {
      type: [
        mongoose.Schema({
          sequence: { type: Number, required: true },
          text: { type: String, required: true },
          from: mongoose.Schema.Types.ObjectID,
        }, { 
          timestamps: true 
        })
      ],
      default: []
    },
    textCount: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

/**
 * Get all channels associated with the user.
 * Get last 100 messages only to calculate unread count max up to 100.
 */
channelSchema.statics.findByUserId = async function (userId) {
  // return Channel.find({ 'participants.userId' : mongodb.ObjectID(userId) }, { messages: { $slice: -TEXT_LIMIT} }).lean()
  return Channel.find({ 'participants.userId' : mongodb.ObjectID(userId) }, { messages: { $slice: -100 }}).lean().sort({ updated_at: -1 });
};

// Return full details
channelSchema.statics.getChannelDetails = async function (channelId, textLimit = TEXT_LIMIT) {
  return Channel.findById(channelId, { messages: { $slice: -textLimit } }).lean()
};

// Update a participant's last received
channelSchema.statics.updateLastReceived = async function (userId, channelId, timestamp) {
  const channel = await Channel.findById(channelId);
  for (let participant of channel.participants) {
    if (participant.userId == userId) {
      participant.lastReceived = timestamp;
      break;
    }
  }

  return channel.save();
};

// Update a participant's last read
channelSchema.statics.updateLastRead = async function (userId, channelId, timestamp) {
  const channel = await Channel.findById(channelId);
  for (let participant of channel.participants) {
    if (participant.userId == userId) {
      participant.lastReceived = timestamp;
      participant.lastRead = timestamp;
      break;
    }
  }

  return channel.save();
};

// Get more texts for a channel
channelSchema.statics.getMoreChannelTexts = async function (channelId, sequenceOffset = 0, textLimit = TEXT_LIMIT) {
  const start = (sequenceOffset-textLimit) < 0 ? 0 : (sequenceOffset-textLimit);
  const end = +sequenceOffset;

  if (start === 0 && end === 0) { // If no more texts to return
    return [];
  } else {
    const channel = await Channel.findById(channelId, { messages: { $slice: [start, end] } }, { messages: 1 }).lean();
    return channel.messages;
  }
};

// TODO: Return only channel participants and the newly created message, currently it returns the entire message list
channelSchema.statics.createMessage = async function (channelId, message) {
  const now = new Date();
  const channel = await Channel.findById(channelId);
  channel.messages.push({...message, sequence: channel.textCount, createdAt: now }); // First message will have sequence = 0
  channel.textCount = channel.textCount + 1;

  // Update last seen and last read
  for (let participant of channel.participants) {
    if (participant.userId == message.from) {
      participant.lastReceived = now;
      participant.lastRead = now;
      break;
    }
  }

  return await channel.save();
};


const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;