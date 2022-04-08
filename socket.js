const socketio = require('socket.io');
const { Channel } = require('./models');

let io;

// User to last seen timestamp mapping - { [string]: string | Date }
const lastSeens = {};
// List of users subscribed to a user - { [string]: Set() }
const subscribersOf = {};
// The socket user's list of users to listen to - { [string]: Set() }
const subscribers = {};

async function init(server) {

    io = socketio(server, {
        cors: {
            origin: process.env.REACT_URL,
        }
    });

    io.on('connection', socket => {
        const userId = socket.handshake.query.id;

        console.log(socket.handshake.query.name, 'connected')

        socket.join(userId);
        
        lastSeens[userId] = "Online";

        subscribersOf[userId]?.forEach(id => socket.broadcast.to(id).emit("update_last_seen", { userId: userId, timestamp: "Online" }));
        
        
        // Update a user's last read timestamp in a channel
        socket.on('update_last_read', async data => {
            const { userId, channelId, timestamp } = data;

            await Channel.updateLastRead(userId, channelId, timestamp);
            const channel = await Channel.findById(channelId, { participants: 1 })

            // Broadcast to all participants of the channel
            for (let participant of channel.participants) {
                socket.broadcast.to(participant.userId).emit("last_read", { 
                    channelId: channelId,
                    userId: userId,
                    timestamp: timestamp,
                });
            }
        })


        // Update a user's last received timestamp in a channel
        socket.on('update_last_received', async data => {
            const { userId, channelId, timestamp } = data;

            await Channel.updateLastReceived(userId, channelId, timestamp);
            const channel = await Channel.findById(channelId, { participants: 1 })

            for (let participant of channel.participants) {
                socket.broadcast.to(participant.userId).emit("last_received", { 
                    channelId: channelId,
                    userId: userId,
                    timestamp: timestamp,
                });
            }
        })

        socket.on('disconnect', () => { 
            console.log(socket.handshake.query.name, 'disconnect')

            // Update last seen timestamp
            lastSeens[userId] = new Date();

            subscribersOf[userId]?.forEach(id => socket.broadcast.to(id).emit("update_last_seen", { userId: userId, timestamp: lastSeens[userId] }));
            
            // Cleanup all subscribed users to the disconnecting user
            clearSubscribers(userId);

        });
    });


    return io;
}

function getSocket() {
    return io;
}

function getLastSeens() {
    return lastSeens;
}

function clearSubscribers(userId) {
    subscribers[userId]?.forEach(id => {
        subscribersOf[id]?.delete(userId);

        if (subscribersOf[id]?.size === 0) {
            delete subscribersOf[id];
        }
    })
    delete subscribers[userId];
}

function subscribeTo(userId, participants) {
    for (let participant of participants) {
        if (participant.userId == userId) continue; // Exclude self

        // Register as a subscriber
        if (subscribersOf[participant.userId]) {
            subscribersOf[participant.userId].add(userId)
        } else {
            subscribersOf[participant.userId] = new Set([userId])
        }

        // Keep track of the subscribed users
        if (subscribers[userId]) {
            subscribers[userId].add(participant.userId)
        } else {
            subscribers[userId] = new Set([participant.userId])
        }
    }
}

function broadcastToAllSubcribers(userId, event, data) {
    subscribersOf[userId]?.forEach(id => io.to(id).emit(event, data));
}

module.exports = { init, getSocket, getLastSeens, clearSubscribers, subscribeTo, broadcastToAllSubcribers };

