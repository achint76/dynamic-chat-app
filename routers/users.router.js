const express = require('express');
//const userRouter = require('express').Router();
// const userRouter = express.Router();
const userRouter = express();
// Parse JSON-encoded request bodies
userRouter.use(express.json());

// Parse URL-encoded request bodies
userRouter.use(express.urlencoded({ extended: true }));

const session = require('express-session');
const { SESSION_SECRET } = process.env;
userRouter.use(session({ secret:SESSION_SECRET, resave: false, saveUninitialized: false}));  //used to sign the session id to add extra layer security

userRouter.set('view engine', 'ejs');
userRouter.set('views', './views');

userRouter.use(express.static('public'));

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name)
    }
  });
    const upload = multer({ storage: storage });
    const UserController = require('../controllers/users.controller');
    const AuthMiddleware = require('../middleware/auth.middleware');
    userRouter.post('/register', upload.single('image'), UserController.register);
    userRouter.get('/register', AuthMiddleware.isLogout, UserController.registerLoading);
    
    userRouter.get('/login',AuthMiddleware.isLogout, UserController.loginLoading);
    userRouter.post('/login', UserController.login);
    userRouter.get('/logout',AuthMiddleware.isLogin, UserController.logout);
    userRouter.get('/dashboard',  AuthMiddleware.isLogin, UserController.dashboardLoading);

    userRouter.get('*', function(req, res){
      res.redirect('/login');     //if any of the top route is not entered or matched to prevent it i will redirect to login route
    })
    
    module.exports = userRouter;