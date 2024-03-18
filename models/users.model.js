const mongoose = require('mongoose');
const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_online: {
        type: Boolean,
        default: false
    }

},
{ timestamps: true });

const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;