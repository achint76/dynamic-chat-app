const AuthMiddleware = {
    async isLogin(req, res, next){
        try{
            if(req.session.user){
                console.log('reqsssionuser', req.session.user);
                next();
            }
            else{
                res.redirect('/user/login');
            }
            //next();
        }catch(error){
            //throw error;
            next(error)
        }
    },
    async isLogout(req, res, next){
        try{
            if(req.session.user){
                res.redirect('/user/dashboard');
            }
            else
            next();
        }catch(error){
           // throw error;
           next(error);
        }
    },

};
module.exports = AuthMiddleware;