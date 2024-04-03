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
    },
    async deleteChat(chatid){
        try{
            //console.log(chatid, "CHATID");
            const deleteMessage = await ChatModel.updateOne(
                {_id: chatid},
                {$set: {is_deleted: true }},
                { new: true }
                );
                console.log(deleteMessage,"DELETEMESSAGE");
                return deleteMessage;
        }catch(error){
            throw error;
        }
    },
    // async updateChat(chatid, updateOptions){
    //     try{
    //         const filter = { _id: chatid};

    //         const updateResult = await ChatModel.updateOne(filter, updateOptions);
    //         console.log(updateResult,"UPDATERESULT");
    //         if (updateResult.modifiedCount === 1) {
                
    //             return updateResult;
    //         } else {
    //             throw new Error('No chat message was updated.');
    //         }
    //     }catch(error){
    //         throw error;
    //     }
    // }
    async updateChat(chatid, updateOptions) {
        try {
            const filter = { _id: chatid };
            const existingChat = await ChatModel.findById(chatid);
            console.log(existingChat,"EXIZTINGCHAT");
            if (!existingChat) {
                throw new Error('Chat message with the provided ID does not exist.');
            }
    
            if (updateOptions && updateOptions.message === existingChat.message) {
                // If the message content remains the same, return a message indicating no update
                return { success: false, message: 'Chat message content remains unchanged.' };
            }
    
            // Perform the update
            const updateResult = await ChatModel.updateOne(filter, updateOptions);
    
            if (updateResult.modifiedCount === 1) {
                // Update was successful
                return { success: true, message: 'Chat message updated successfully.' };
            } else {
                // Update failed
                throw new Error('No chat message was updated.');
            }
        } catch (error) {
            throw error;
        }
    }
    
    
    
    
};

module.exports = ChatService;