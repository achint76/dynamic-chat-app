const ChatModel = require('../models/chats.model');
const ChatService = {
    async saveChat(payload){
        try{
            
            const messageData = await ChatModel.create(payload);
            //console.log(messageData,"MSGDATA");
            return messageData;
        }catch(error){
            throw error;
        }
    }
};

module.exports = ChatService;