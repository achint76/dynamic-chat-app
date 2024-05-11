const mongoose = require('mongoose');
const memberSchema = mongoose.Schema({
    group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    
    is_deleted: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true });
const MembersModel = mongoose.model('members', memberSchema);
module.exports = MembersModel;