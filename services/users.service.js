const UserModel = require('../models/users.model');
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
}
};
module.exports = UserService;
