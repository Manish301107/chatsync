const express = require('express');
const { Server } = require('socket.io')
const cors = require('cors');
const app = express();
// const path = require('path');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://dapper-wisp-231948.netlify.app"
    }
});

// Socket connection for single conversations :
const rooms = [];
const group = [];

io.on('connection', (socket) => {
    let currentRoom = null;
    let username;
    let profile_src;
    let IsOtherUserConnected = false;
    let findUserComdown = 0;

    socket.on('conversationType', (conversationType) => {
        if (conversationType == "group") {
            // Group Chat management :
            socket.on('join-group', (userDetail) => {
                let user = userDetail.split('~')
                socket.broadcast.emit('newUserData', userDetail)
                if (group.length === 0) {
                    socket.emit('existUser', "Wait! for other users")
                } else {
                    socket.emit('existUser', `${group.join(', ')} (${group.length}) is already in chat`)
                    socket.broadcast.emit('info', `${group.length}`)
                }
                group.push(user[0])
                username = user[0]
            })

            socket.on('group-chat-msg', (message) => {
                socket.emit('info', `${group.length - 1}`)
                socket.broadcast.emit('receivedGroupMsg', message)
            })

            socket.on('disconnect', () => {
                socket.broadcast.emit('exitAlert', `${username} has exit the group`)
                let index = group.indexOf(username)
                if (index !== -1) {
                    group.splice(index, 1)
                }
                socket.broadcast.emit('info', `${group.length}`)
            })
        } else {

            // Single Chat management :
            socket.on('join room', (nameAndPic) => {
                let connected_data = nameAndPic.split('~')
                if (rooms.length === 0 || rooms[rooms.length - 1].length === 2) {
                    rooms.push([]);
                }

                currentRoom = rooms[rooms.length - 1]
                currentRoom.push(socket);

                username = connected_data[0]
                profile_src = connected_data[1]

                if (currentRoom.length === 1) {

                    if (!IsOtherUserConnected) {
                        socket.emit('connected', "Wait!! for connection")

                        let checkUser = setInterval(() => {
                            // console.log("Wait! for connection")
                            findUserComdown++
                            if (currentRoom.length === 2) {
                                socket.broadcast.emit('connected', `You are connected with ${connected_data[0]}~${connected_data[0]}~${profile_src}`)
                                IsOtherUserConnected = true

                                if (IsOtherUserConnected) {
                                    clearInterval(checkUser)
                                }
                            }
                            // console.log(findUserComdown)
                            if (findUserComdown == 59) {
                                clearInterval(checkUser)
                                socket.emit('notFound', "Not found Any people. Find again!!")
                            }
                        }, 1000)

                    }
                } else if (currentRoom.length === 2) {
                    socket.broadcast.emit('connected', `You are connected with ${connected_data[0]}~${connected_data[0]}~${profile_src}`)
                }
            })


            socket.on('chat message', (message) => {
                if (currentRoom && currentRoom.length === 2) {
                    // Check if both users in the room are defined before emitting the message
                    const senderSocket = currentRoom.find((userSocket) => userSocket.id === socket.id);
                    if (senderSocket) {
                        // Use broadcast to send the message to all other clients in the same room
                        socket.to(currentRoom[0].id).to(currentRoom[1].id).emit('receivedMsg', message);
                        // socket.emit("connecterName", username)
                    }
                }
            });

            socket.on('disconnect', () => {
                socket.broadcast.emit('alert', `${username} has been exit`)
                socket.broadcast.emit('notFound', 'Connect with Someone!') //change connect botton text
                if (currentRoom) {
                    // Remove the user from the current room
                    const index = currentRoom.indexOf(socket);
                    if (index !== -1) {
                        currentRoom.splice(index, 1);
                    }

                    // If room is empty, remove it
                    if (currentRoom.length === 0) {
                        const roomIndex = rooms.indexOf(currentRoom);
                        if (roomIndex !== -1) {
                            rooms.splice(roomIndex, 1);
                        }
                    }
                }
            });
        }
    })
});


const PORT = process.env.PORT || 3011;
server.listen(PORT, () => {
    // console.log(`Server is Running on PORT:${PORT}`)
})
