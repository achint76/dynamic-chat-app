const mongoose = require('mongoose');
const groupChatSchema = mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
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
const groupChatModel = mongoose.model('groupChats', groupChatSchema);
module.exports = groupChatModel;