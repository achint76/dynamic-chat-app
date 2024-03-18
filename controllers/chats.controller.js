const ChatModel = require('../models/chats.model');
const ChatService = require('../services/chats.service');

const ChatController = {
    async saveChat(req, res){
        try{
            const {sender_id, receiver_id, message} = req.body;
            const data = req.body;
            const chatData = await ChatService.saveChat(data);
            res.status(200).send({ success: true, msg: "Chat saved!", data: chatData});
        }catch(error){
            res.status(400).send({ success: false, msg: error.message});
        }
    }
};
module.exports = ChatController;