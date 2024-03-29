const ChatModel = require('../models/chats.model');
const ChatService = require('../services/chats.service');

const ChatController = {
    async saveChat(req, res){
        try{
            const {sender_id, receiver_id, message} = req.body;
            const data = req.body;
           // console.log("DATADATADATA", data);
            const chatData = await ChatService.saveChat(data);
           // console.log(chatData,"CHATDATA");
            res.status(200).send({ success: true, msg: "Chat saved!", data: chatData});
        }catch(error){
            console.log("ERROR", error);
            res.status(400).send({ success: false, msg: error.message});
        }
    }
};
module.exports = ChatController;