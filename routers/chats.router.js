
// chatRouter.js

const express = require('express');
const chatRouter = express();
const session = require('express-session');
const ChatController = require('../controllers/chats.controller');

// Set up session middleware
//chatRouter.use(session({ /* session configuration */ }));

// Define chat routes
chatRouter.post('/save-chat', ChatController.saveChat);

// Export the chatRouter module
module.exports = chatRouter;
