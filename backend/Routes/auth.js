import 'dotenv/config';
import express from 'express';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oidc';
import User from '../models/User.js';

const authRouter = express.Router();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://a-k-gpt-backend.onrender.com/auth/oauth2/redirect/google',
    scope: ['profile', 'email']
}, 
async function verify(issuer, profile, cb) {
    try {
        let email = profile.emails?.[0]?.value;

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                name: profile.displayName,
                googleId: profile.id,
                email: email || ""
            });
        }

        return cb(null, user);
    } catch (err) {
        return cb(err);
    }
}));


// Google Login
authRouter.get('/login/federated/google', passport.authenticate('google'));

// Google Redirect
authRouter.get('/oauth2/redirect/google', 
    passport.authenticate('google', {
        successRedirect: 'https://a-k-gpt-7qx2.onrender.com/',
        failureRedirect: 'https://a-k-gpt-7qx2.onrender.com/'
    })
);


// Passport session handling
passport.serializeUser((user, cb) => cb(null, { id: user.id }));
passport.deserializeUser((obj, cb) => cb(null, obj));


// Status Route
authRouter.get("/status", (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ isLoggedin: true, user: req.user });
    } else {
        res.json({ isLoggedin: false });
    }
});


// Logout
authRouter.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect('https://a-k-gpt-7qx2.onrender.com/');
        });
    });
});

export default authRouter;
