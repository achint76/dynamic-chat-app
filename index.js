require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const port = 3000;
const url = process.env.URL || "http://localhost";


app.use(express.json());
app.use(express.static('public'));
const userRoute = require('./routers/users.router');
const chatRoute = require('./routers/chats.router');
const UserModel = require('./models/users.model');
const ChatModel = require('./models/chats.model');
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO);
        console.log("connected to mongodb");
    } catch (error) {
        throw error;
    }
}

app.use('/user', userRoute);
app.use('/chat', chatRoute);

const io = require('socket.io')(http);
const usp = io.of('/user-namespace');
usp.on('connection', async function (socket) {
    console.log("user connected");
    // console.log(socket.handshake.auth.token,"SOCKET---");
    const userId = socket.handshake.auth.token;
    const status = await UserModel.findOneAndUpdate(
       { _id: userId },
       { $set: { is_online: true}},
       { new: true }
    );

    //user broadcast  online status
    socket.broadcast.emit('getOnlineUser', { user_id: userId });
    socket.on('disconnect', async function () {
        console.log("user disconnected");

        const userId = socket.handshake.auth.token;
    const status = await UserModel.findOneAndUpdate(
       { _id: userId },
       { $set: { is_online: false}},
       { new: true }
    );

    //user broadcast offline status
    socket.broadcast.emit('getOfflineUser', {user_id: userId } );
    
    })

    //chatting implementation
    socket.on('newChat', function(data){
        console.log(data, ">>>DATA");
        socket.broadcast.emit('loadNewChat', data);
    })

    //load old chats
    socket.on('existsChat', async function(data){
        const chats = await ChatModel.find({ $or: [
            { sender_id: data.sender_id, receiver_id: data.receiver_id },
            { sender_id: data.receiver_id, receiver_id: data.sender_id }
        ]})

        socket.emit('loadChats', { chats: chats });
    })

    //delete chats
    socket.on('chatDeleted', function(id){
        socket.broadcast.emit('chatMessageDeleted', id);
    })

    //update chats
    socket.on('chatUpdated', function(data){
        socket.broadcast.emit('chatMessageUpdated', data);
    })


    //new group chat added
    socket.on('newGroupChat', function(data){
        socket.broadcast.emit('loadNewGroupChat', data)
    })

    socket.on('groupChatDeleted', function(id){
        socket.broadcast.emit('groupChatMessageDeleted', id);  //broadcast chat deleted id
    })


    socket.on('groupChatUpdated', function(data){
        socket.broadcast.emit('groupChatMessageUpdated', data);
    })
});
// app.listen(port, ()=> {
//     connect();
//     console.log(`Server listening at ${url}:${port}`);
// })

http.listen(port, () => {
    connect();
    console.log(`Server listening at ${url}:${port}`);
})




