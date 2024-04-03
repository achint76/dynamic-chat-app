
// chatRouter.js

const express = require('express');
const chatRouter = express();
const session = require('express-session');
const ChatController = require('../controllers/chats.controller');
// Parse JSON-encoded request bodies
chatRouter.use(express.json());

// Parse URL-encoded request bodies
chatRouter.use(express.urlencoded({ extended: true }));

// Set up session middleware
//chatRouter.use(session({ /* session configuration */ }));

// Define chat routes
chatRouter.post('/save-chat', ChatController.saveChat);
//route for deleting chats
chatRouter.put('/delete-chat', ChatController.deleteChat);
chatRouter.put('/update-chat', ChatController.updateChat);
// Export the chatRouter module
module.exports = chatRouter;
