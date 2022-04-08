const express = require('express');
const { Channel, User } = require('../models');
const mongodb = require("mongodb");
const { assertNotNull } = require('../common/helpers');
const { requireLogin } = require('../common/middlewares');
const { getSocket, getLastSeens, subscribeTo } = require('../socket');

const router = express.Router();


// Get channel texts
router.get('/', requireLogin, async function(req, res) {
    const { channelId, sequenceOffset, textLimit } = req.query;

    try {
        assertNotNull({ channelId, sequenceOffset })
    } catch(err) {
        res.status(400).send(err);
        return;
    }
    
    try {
        const messages = await Channel.getMoreChannelTexts(channelId, sequenceOffset, textLimit);

        // Reverse messages
        const newMessages = messages.slice().reverse();

        res.send(newMessages);
        
    } catch(err) {
        // Catch and return any uncaught exceptions while inserting into database
        console.log(err);
        res.status(500).send(err);
    }
});


// Create new text
router.post('/', requireLogin, async function(req, res) {
    const { channelId, text, key } = req.body; // key is used to let the receiver identify his/her text and merge on the frontend
    
    try {
        assertNotNull({ channelId, text, key })
    } catch(err) {
        res.status(400).send(err);
        return;
    }

    try {
        const user = res.locals.user;
        const io = getSocket();

        const channel = await Channel.createMessage(channelId, { text: text, from: user.id });
        const newText = channel.messages.slice(-1)[0];

        // Broadcast to participants of the channel
        for (let participant of channel.participants) {
            if (participant.userId != user.id) { // Except sender
                io.to(participant.userId).emit('message', { newText: newText.toJSON(), channelId: channel._id })
            }
        }

        res.send(newText);

    } catch(err) {
        // Catch and return any uncaught exceptions while inserting into database
        console.log(err);
        res.status(500).send(err);
    }

});

module.exports = router;