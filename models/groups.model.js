const mongoose = require('mongoose');
const groupSchema = mongoose.Schema({
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
       // required: true
    },
    name: {
        type: String,
       // ref: 'users',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    limit: {
        type: Number,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true });
const GroupsModel = mongoose.model('groups', groupSchema);
module.exports = GroupsModel;