import 'dotenv/config';
import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import mongoose from 'mongoose';
import User from '../models/User.js';

const authRouter = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/oauth2/redirect/google',
    scope: ['profile']
}, async function verify(issuer, profile, cb) {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                name: profile.displayName,
                googleId: profile.id,
            });
        }

        console.log("User:", user);

        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}
));

authRouter.get('/login/federated/google', passport.authenticate('google'));

authRouter.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/',
    failureRedirect: 'http://localhost:5173/'
}));

passport.serializeUser(function(user,cb) {
    process.nextTick(function() {
        cb(null, { id: user.id})
    });
});

passport.deserializeUser(function(user,cd){
    process.nextTick(function() {
        return cd(null, user);
    });
});

authRouter.get('/login', (req, res, next) => {
    res.render('login.ejs');
});

authRouter.get("/status",(req,res)=>{
    if(req.isAuthenticated()) {
        res.json({isLoggedin: true, user: req.user});
    } else {
        res.json({isLoggedin: false});
    }
})

authRouter.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('http://localhost:5173/');
  });
});

export default authRouter;