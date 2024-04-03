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
    },
    async deleteChat(req, res){
        try{
            const chatid = req.query._id;
            //console.log(chatid,"CONTROLLER")
            const messageDeleted = await ChatService.deleteChat(chatid);
            res.status(200).send({ success: true, data: messageDeleted});
        }catch(error){
            console.log("ERROR", error);
            res.status(400).send({ success: false, msg: error.message });
        }
    },
    async updateChat(req, res){
        try{
            const chatid = req.body._id;
            console.log("chatid", chatid);
            //const updateOptions = {};
            const updateOptions = {
                message: req.body.message
            };
            const updateMessage = await ChatService.updateChat(chatid, updateOptions);
            console.log("UPDATEMESSAGE", updateMessage);
            res.status(200).send({ success: true, data: updateMessage});
        }catch(error){
            console.log(error, "ERROR");
            res.status(400).send({success: false, msg: error.message });
        }
    }
};
module.exports = ChatController;