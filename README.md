# 💬 Dynamic Chat App

A real-time chat application built using **Node.js**, **Express**, **MongoDB**, **Socket.IO**, and **EJS** templating. This app allows users to communicate one-on-one or in group chats with real-time updates, chat persistence, authentication, and online/offline status tracking.

---

## 🚀 Features

- User Registration & Login (with password hashing)
- Real-time one-on-one & group messaging using Socket.IO
- Online/offline user status broadcasting
- Persistent chat storage using MongoDB
- Edit & delete message functionality
- Shareable group chat links
- EJS templating with partials (header, footer)
- Socket-based session management
- Organized MVC-style folder structure

---

## 🛠 Tech Stack

| Technology       | Usage                          |
|------------------|--------------------------------|
| Node.js          | Backend runtime                |
| Express.js       | Web framework                  |
| MongoDB + Mongoose | Database & ODM               |
| EJS              | View templating                |
| Socket.IO        | Real-time bidirectional communication |
| dotenv           | Manage environment variables   |
| bcrypt           | Password hashing               |
| multer           | File uploads                   |
| express-session  | Session handling               |
| nodemon          | Auto-reloading during dev      |

---

## 📁 Folder Structure

├── index.js # Main server entry point ├── .env # Environment variables ├── package.json # Project dependencies ├── models/ │ ├── users.model.js │ └── chats.model.js ├── routers/ │ ├── users.router.js │ └── chats.router.js ├── views/ │ ├── layouts/ │ │ ├── header.ejs │ │ └── footer.ejs │ ├── chat-group.ejs │ ├── dashboard.ejs │ ├── error.ejs │ ├── group.ejs │ ├── login.ejs │ ├── register.ejs │ └── shareLink.ejs ├── public/ # Static assets (CSS, images, etc.)


---

## 🔐 Environment Variables

Create a `.env` file in your root directory with the following:

MONGO=mongodb://127.0.0.1:27017/dynamic-chat-app SESSION_SECRET=thisismysessionsecret


---

## ⚙️ Setup & Run Instructions

### 1. Clone the repository


git clone https://github.com/achint76/dynamic-chat-app.git
cd dynamic-chat-app

2. Install dependencies

npm install

3. Setup environment variables
Create a .env file as shown above.

4. Run the application

npm start

The app will start at:
📍 http://localhost:3000

##  Real-time Functionality
The app uses Socket.IO namespaces and event listeners:

user-namespace for user-specific socket handling

Events:

newChat, loadNewChat

existsChat, loadChats

chatDeleted, chatMessageDeleted

chatUpdated, chatMessageUpdated

newGroupChat, loadNewGroupChat

groupChatDeleted, groupChatMessageDeleted

groupChatUpdated, groupChatMessageUpdated

Online status tracking via getOnlineUser & getOfflineUser

 ## MVC Flow Summary
Models: Mongoose schemas for User and Chat.

Views: EJS templates for login, register, dashboard, chat, etc.

Controllers/Routes: Organized in routers/ for user and chat logic.

Socket Events: Handled directly in index.js under user-namespace

Future Improvements
Add typing indicators

Integrate file/image upload in chats

Improve UI with modern design (Tailwind/Bootstrap)

Add email verification or OAuth login

Dockerize the app for deployment

## Author
Made with ❤️ by Achintya Raj
GitHub: https://github.com/achint76

## 📄 License
This project is licensed under the MIT License.


---


