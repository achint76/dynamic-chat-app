const { addMembers, updateChatGroup, deleteChatGroup } = require('../controllers/users.controller');
const GroupsModel = require('../models/groups.model');
const UserModel = require('../models/users.model');
const MembersModel = require('../models/members.model');
const groupChatModel = require('../models/groupChat.model');
const { update } = require('lodash');
//const userModel = require('../models/users.model');
const UserService = {
    async createUser(payload){
        try{
            const {name, email, image, password} = payload;
             // Check if the email already exists
             const existingUser = await UserModel.findOne({ email });
             if(existingUser) {
                 throw new Error('Email already exists');
             }
            const createData = await UserModel.create(payload);
            return createData;
        }catch(error){
            throw error;
        }
    },
    async getUserByEmail(email){
        try{
            const isValid = await UserModel.findOne({email: email});
            return isValid;
        
    }catch(error){
        throw error;
    }
},
async createGroups(payload){
    try{
        const groupsdata = await GroupsModel.create(payload);
        console.log("GROUPSDATA", groupsdata);
        return groupsdata;
    }catch(error){
        throw error;
    }
},
async addMembers(data){
    try {
        const result = await MembersModel.insertMany(data);
        return result;
    } catch (error) {
        throw error;
    }
},
async removeExistingMembers(groupId) {
    try {
        await MembersModel.deleteMany({ group_id: groupId });
    } catch (error) {
        throw error;
    }
},
async updateChatGroup(id, updateObj){
    try{
        const filter = { _id: id };
        const updateResult = await GroupsModel.updateOne(filter, updateObj);
        return updateResult;
    }catch(error){
        throw error;
    }
},
async deleteChatGroup(id){
    try{
        await GroupsModel.deleteOne({ _id: id});
    }catch(error){
        throw error;
    }
},
async deletemember(id){
    try{
        await MembersModel.deleteMany({ _id: id});
    }catch(error){
        throw error;
    }
},

async shareGroup(id){
    try{
        const verifyId = await GroupsModel.findOne({ _id: id});
        return verifyId;
    }catch(error){
        throw error;
    }
},
async getdetails(id){
    try{
        console.log("Id", id);
        const getDetails = await MembersModel.find({group_id: id}).count();
        return getDetails;
    }catch(error){
        throw error;
    }
},

async saveGroupChat(payload){
    try{
        const groupChat = await groupChatModel.create(payload);
        return groupChat;
    }catch(error){
        throw error;
    }
}
};
module.exports = UserService;
