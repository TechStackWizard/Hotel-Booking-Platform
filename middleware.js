module.exports.isLoggedIn = (req, res, next) =>{
    
    if(!req.isAuthenticated()){
        req.session.requestUrl = req.originalUrl;
        req.flash('error',"You must be login first!!");
        return res.redirect('/login')
    } next();
}


module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.requestUrl){
        res.locals.requestUrl = req.session.requestUrl;
        
    } 
    next();
}