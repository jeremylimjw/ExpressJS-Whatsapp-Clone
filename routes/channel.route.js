const express = require('express');
const { Channel, User } = require('../models');
const mongodb = require("mongodb");
const { assertNotNull } = require('../common/helpers');
const { requireLogin } = require('../common/middlewares');
const { getSocket, getLastSeens, subscribeTo } = require('../socket');

const router = express.Router();


// Get all channels associated to the user
router.get('/', requireLogin, async function(req, res) {
    try {
        const user = res.locals.user;

        const lastSeenStore = getLastSeens();

        // Contact list of user details
        const contacts = {};

        const channels = await Channel.findByUserId(user.id);

        // Add unread_count and last_text
        for (let channel of channels) {

            // Update the user's last received
            const now = new Date();
            await Channel.updateLastReceived(user.id, channel._id, now);

            // Agregate unread count and last text
            const sender = channel.participants.filter(x => x.userId === user.id)[0];
            const unreadCount = channel.messages.reduce((prev, current) => {
                if (current.createdAt > sender?.lastRead) {
                    return prev+1;
                }
                return prev;
            }, 0)

            channel.lastText = channel.messages.length > 0 ? channel.messages[channel.messages.length-1] : null;
            channel.unreadCount = unreadCount;

            // Broadcast to participants the user's updated last received
            const io = getSocket();
            for (let participant of channel.participants) {
                // Except sender
                if (participant.userId != user.id) {
                    // Send last received timestamp
                    io.to(participant.userId).emit('last_received', { 
                        userId: user.id,
                        channelId: channel._id,
                        timestamp: now,
                    })

                    // Record to contacts
                    if (contacts[participant.userId] == null) {
                        contacts[participant.userId] = await User.getUserDetails(participant.userId);
                    }

                    // Record last seens
                    contacts[participant.userId].lastSeen = lastSeenStore[participant.userId];
                }
            }

            channel.messages = [];

            // Subscribe to their last seens via ws
            subscribeTo(user.id, channel.participants);
        }

        const response = {
            channels: channels,
            contacts: contacts,
        }
        res.send(response);
  
    } catch(err) {
        console.log(err);
        res.status(500).send(err);
    }
});


// Get full channel details
router.get('/detail', requireLogin, async function(req, res) {
    const { id: channelId, textLimit } = req.query;

    try {
        assertNotNull({ channelId })
    } catch(err) {
        res.status(400).send(err);
        return;
    }
    
    try {
        const user = res.locals.user;

        // Update the user's last received and last read
        const now = new Date();
        await Channel.updateLastRead(user.id, channelId, now);

        // Get the full channel document
        const channel = await Channel.getChannelDetails(channelId, textLimit);

        // Broadcast to participants the user's last read
        const io = getSocket();
        for (let participant of channel.participants) {
            // Except sender
            if (participant.userId != user.id) {
                io.to(participant.userId).emit('last_read', { 
                    userId: user.id,
                    channelId: channel._id,
                    timestamp: now,
                })
            }
        }

        // Reverse messages
        channel.messages = channel.messages.slice().reverse();

        res.send(channel);
        
    } catch(err) {
        // Catch and return any uncaught exceptions while inserting into database
        console.log(err);
        res.status(500).send(err);
    }
});


// Create new channel
router.post('/', requireLogin, async function(req, res) {
    const { title, ownerId, participantUsernames } = req.body;
    
    try {
        assertNotNull({ ownerId, participantUsernames })
    } catch(err) {
        res.status(400).send(err);
        return;
    }

    try {
        const user = res.locals.user;
        const io = getSocket();

        const participants = [{ userId: ownerId }];
        for (let username of participantUsernames) {
            const receiver = await User.findOne({ username: username }, { _id: 1 }).lean();
            if (receiver == null) {
                res.status(400).send(`Username '${username}' not found.`);
                return;
            }
            participants.push({ userId: receiver._id });
        }

        const newChannelObj = await Channel.create({ title: title, ownerId: ownerId, participants: participants });
        const newChannel = newChannelObj.toJSON();
        
        const lastSeenStore = getLastSeens();
        const contacts = {};

        // Get new contacts for the users to see their info
        for (let participant of newChannel.participants) {
            // Record all contact info and last seens
            contacts[participant.userId] = await User.getUserDetails(participant.userId);
            contacts[participant.userId].lastSeen = lastSeenStore[participant.userId];

            subscribeTo(participant.userId, newChannel.participants);
        }

        // Broadcast to participants the new channel
        for (let participant of newChannel.participants) {
            if (participant.userId != user.id) { // Except sender
                io.to(participant.userId).emit('new_channel', { newChannel: newChannel, newContacts: contacts })
            }
        }
        
        subscribeTo(user.id, newChannel.participants);

        const response = {
            newChannel: newChannel,
            contacts: contacts,
        }
        res.send(response);

    } catch(err) {
        // Catch and return any uncaught exceptions while inserting into database
        console.log(err);
        res.status(500).send(err);
    }

});



// Delete a channel
router.delete('/', requireLogin, async function(req, res, next) {
    const { channelId } = req.query
    
    try {
        assertNotNull({ channelId })
    } catch(err) {
        res.status(400).send(err);
        return;
    }

    try {
        const user = res.locals.user;
        const io = getSocket();

        const channel = await Channel.findById(channelId, { participants: 1, ownerId: 1 }).lean()

        // Broadcast to participants the channel
        for (let participant of channel.participants) {
            if (participant.userId !== user.id) { // Except sender
                io.to(participant.userId).emit('remove_channel', { channelId: channelId })
            }
        }

        await Channel.deleteOne({ _id: channel._id });

        res.send({ id: channelId });

    } catch(err) {
        // Catch and return any uncaught exceptions while inserting into database
        console.log(err);
        res.status(500).send(err);
    }

});

module.exports = router;