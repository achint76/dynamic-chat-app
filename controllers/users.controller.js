const UserService = require('../services/users.service');
const UserModel = require('../models/users.model');
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
    }
};
module.exports = UserController;