const UserService = require('../services/users.service');
const UserModel = require('../models/users.model');
const GroupsModel = require('../models/groups.model');
const MembersModel = require('../models/members.model');
const groupChatModel = require('../models/groupChat.model');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
//const { Types } = require('mongoose');
//const userService = require('../services/users.service');
const bcrypt = require('bcrypt');
const UserController = {
    async registerLoading(req, res){
        try{
            res.render('register');
           
        }catch(error){
            throw error;
        }
    },
    async register(req, res){
        try{
            const data = req.body;
            const hashedPassword = await bcrypt.hash(data.password, 10);  //here 10 is the saltrounds used with bcrypt
            //niw replacing the plain text password swith the hashed one
            data.password = hashedPassword;
            data.image = 'images/'+ req.file.filename;
            const registration = await UserService.createUser(data);
            // res.status(200).json({
            //     success: true,
            //     message: 'user created',
            //     user: registration
            // });
            if(!registration){
                res.render('register', {message: 'user with this email already exists!'});
            }

             res.render('register', {message: 'Your registration has been completed! '});

        }catch(error){
            console.error('Error creating user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message,
            });
        }
    },

    async loginLoading(req, res){
        try{
        //      // Check if user is already logged in
        // if (req.session.user) {
        //     return res.redirect('/user/dashboard');
        // }    //can be added based on logic and feature
            res.render('login');
        }catch(error){
            throw error;
        }
    },
    async login(req, res){
    try{
        const {email, password} = req.body;
        const userData = await UserService.getUserByEmail(email);
        if(!userData){
            return res.render('login', {message: 'Invalid email'});
        }
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
           // return res.status(401).json({ success: false, message: 'Incorrect password' });
           res.render('login', {message: "passsword is incorrect!"})
        }
        req.session.user = userData;
        res.cookie(`user`, JSON.stringify(userData));
        res.redirect('/user/dashboard');
    }catch(error){
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
}
    },
    async logout(req, res){
    try{
        res.clearCookie(`user`);
        req.session.destroy();
        res.redirect('/user/login');
    }catch(error){
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
}
    },
    async dashboardLoading(req, res){
    try{
        
        const user = req.session.user || {}; // Set a default empty object if req.session.user is undefined
        const users = await UserModel.find({_id: { $nin: [req.session.user._id]}})
        res.render('dashboard', { user, users: users });
        //res.render('dashboard', {user: req.session.user});
    }   catch(error){
        console.error('Error loading dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
}     
    },

    async groupLoading(req, res){
        try{
            console.log(req.session.user._id,"REQSESSUSID");
            const groups = await GroupsModel.find({ creator_id: req.session.user._id });
            res.render('group', { groups: groups});
        }catch(error){
            throw error;
        }
    },

    async createGroups(req, res){
        try{
            const data = req.body;
            console.log(data, "DATA");
            //const {name, image, limit} = req.body;
            if(!data || !data.name || !req.file || !data.limit){
                return res.status(400).json({
                    success: false,
                    message: 'Incomplete data provided'
                });
            }
           // adding a  Check if req.session.user._id is present and correct
            if (!req.session.user || !req.session.user._id) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user session'
                });
            }

            
            data.image = 'images/'+ req.file.filename;
            // Setting  the creator_id
            data.creator_id = req.session.user._id;
            const createdData = await UserService.createGroups(data);
            console.log(createdData, "CREATEDDATA");
            console.log("REQSESSIONUSERID", req.session.user._id);
            const groups = await GroupsModel.find({ creator_id: req.session.user._id });
            console.log(groups, "GROIUOS");
            res.render('group', {message: req.body.name+' Group created Successfully!!', groups: groups});
        }catch(error){
            console.error('Error', error);
            res.status(500).json({
                success: false,
                message: 'internal Server Error',
                error: error.message
            })
        }
    },

    async getMembers(req, res){
        try{
            
            console.log("REQBODYGROUPID", req.body.group_id);
            const users = await UserModel.aggregate([
                {
                    $lookup: {
                        from: "members",
                        localField: "_id",
                        foreignField: "user_id",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: [ "$group_id", new mongoose.Types.ObjectId(req.body.group_id)]}
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "member"
                    }
                },
                {
                    $match: {
                        "_id": {
                            $nin: [new mongoose.Types.ObjectId(req.session.user._id)]
                        }
                    }
                }
            ]);
            res.status(200).send({ success: true, data: users});
        }catch(error){
            console.log(error, "ERROR");
            res.status(400).send({success: false, msg: error.message });
        }
    },
    async addMembers(req, res){
        try{
            if(!req.body.members){
                res.status(200).send({success: false, msg: 'Please select any one member!'});   
            }else if(req.body.members.length > parseInt(req.body.limit)){
                res.status(200).send({success: false, msg: 'You cannot select more than '+ req.body.limit+' Members'});
            }else{

                 // Remove existing members
            await UserService.removeExistingMembers(req.body.group_id);


                var data = [];
                const members = req.body.members;
                console.log(members,"MEMBERS");
                for(let i=0;i<members.length;i++){
                    data.push({
                        group_id: req.body.group_id,
                        user_id: members[i]
                    });
                    console.log(data,"DATA");
                }
                const addingMembers = await UserService.addMembers(data);
            res.status(200).send({ success: true, msg: 'Members added successfully'});
        }
    }catch(error){
            console.log(error, "ERROR");
            res.status(400).send({success: false, msg: error.message });
        }
    },

    async updateChatGroup(req, res){
        try{
            if(parseInt(req.body.limit) < parseInt(req.body.last_limit)){
                await MembersModel.deleteMany({group_id: req.body.id});
            }
            var updateObj = {};
            if(req.file != undefined){
                updateObj = {
                    name: req.body.name,
                    limit: req.body.limit,
                    image: 'images/'+req.file.filename,
                }
            }else{
                updateObj = {
                    name: req.body.name,
                    limit: req.body.limit,

                }
            }
            const updatedData = await UserService.updateChatGroup(req.body.id, updateObj);
            res.status(200).send({ success: true, msg: 'Chat group updated successfully!'});
        }catch(error){
            console.log(error, "ERROR");
            res.status(400).send({success: false, msg: error.message });
        }
    },

    async deleteChatGroup(req, res){
        try{
            const deletegroup = await UserService.deleteChatGroup(req.body.id);
            const deletemember = await UserService.deletemember(req.body.id);
            res.status(200).send({ success: true, msg: 'Chat group deleted successfully!'});
        }catch(error){
            console.log(error, "error");
            res.status(400).send({ success: false, msg: error.message });
        }
    },

    async shareGroup(req, res){
        try{
            const verifyId = await UserService.shareGroup(req.params.id);
            if(!verifyId){
                res.render('error', {message: '404 not found!'});
            }
            else if(req.session.user == undefined){
                res.render('error', {message: 'You need to login to access the shared URL'});

            }else{
                console.log("REQPARAMSID", req.params.id);
                const id = new ObjectId(req.params.id);
                const userId = new ObjectId(req.session.user._id);
                const memberGroupDetails = await UserService.getdetails(id);
                console.log("MEMBERFGROUPDETAILS", memberGroupDetails);
                var available = verifyId.limit - memberGroupDetails;
                console.log("ID", req.session.user._id);
                console.log("CREATORID", verifyId.creator_id);
                var isOwner = verifyId.creator_id == req.session.user._id ? true:false;
                var isJoined = await MembersModel.find({ group_id: id, user_id: userId}).count();
                console.log("ISJOINED", isJoined);
                console.log(req.session.user._id,"REQSESIONUSERID");
                console.log(userId, "USERID");
                res.render('shareLink', {group: verifyId, totalmembers: memberGroupDetails, available: available, isOwner: isOwner, isJoined: isJoined});

            }
            }catch(error){
            console.log(error, "error");
            res.status(400).send({ success: false, message: error.message});
        }
    },

    async joinGroup(req, res){
        try{
            const group_id = req.body.group_id;
            const user_id = req.session.user._id;
            var data = {};
            data.group_id = group_id;
            data.user_id = user_id;
            const member = await UserService.addMembers(data);
            res.status(200).send({ success: true, msg: "You have joined the group successfully!"});
        }catch(error){
            console.log("ERROR", error);
            res.status(400).send({ success: false, msg: error.message});
        }
    },

    async groupChat(req, res){
        try{
            const userId = new ObjectId(req.session.user._id);
            console.log("USERID", userId);
            const myGroups = await GroupsModel.find({ creator_id: userId });
            console.log("MYGROUPS", myGroups);
            //const myGroups = await GroupsModel.find({ creator_id: req.session.user._id});
            const joinedGroups = await MembersModel.find({ user_id: req.session.user._id}).populate('group_id');

            res.render('chat-group', {myGroups: myGroups, joinedGroups: joinedGroups});
            
        }catch(error){
            console.log("ERROR", error);
            res.status(400).send({success: false, msg: error.message});
        }
    },

    async saveGroupChat(req, res){
        try{
            const data = req.body;
            const groupChat = await UserService.saveGroupChat(data);
            var chatData = await groupChatModel.findOne({_id: groupChat._id}).populate('sender_id');
            res.status(200).send({ success: true, chat: chatData});
        }catch(error){
            console.log(error, "ERROR");
            res.status(400).send({ success: false, msg: error.message });
        }
    },

    async loadGroupChats(req, res){
        try{
            const groupChats = await groupChatModel.find({ group_id: req.body.group_id}).populate('sender_id');
            res.send({ success: true, chats: groupChats });
        }catch(error){
            res.status(400).send({ success: false, msg: error.message });
        }
    },

    async deleteGroupChat(req, res){
        try{
            await groupChatModel.deleteOne({ _id: req.body.id});
            res.send({ success: true, msg: 'Chat deleted'});
        }catch(error){
            res.status(400).send({ success: false, msg: error.message });
        }
    },

    async updateGroupChat(req, res){
        try{
            await groupChatModel.findByIdAndUpdate({ _id: req.body.id }, {
                $set:{
                    message: req.body.message
                }
            });
            res.send({ success: true, msg: 'Chat edited'});
        }catch(error){
            res.status(400).send({ success: false, msg: error.message });
        }
    }
};
module.exports = UserController;