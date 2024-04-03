const mongoose = require('mongoose');
const chatSchema = mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true });
const ChatModel = mongoose.model('chats', chatSchema);
module.exports = ChatModel;