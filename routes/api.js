const express = require('express')
const router = express.Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const { auth, memberAuth, adminAuth } = require("../middleware/auth")

const User = require('../models/User')

passport.use(new GoogleStrategy({
    clientID: "861672875050-13djnn0pkqsovr4c4daijvu8vmntolg8.apps.googleusercontent.com",
    clientSecret: "bSuHEQkRBBnL7ZVpi5xRaFEq",
    callbackURL: "http://localhost:3000/api/adg/verified"
  },
  async (accessToken, refreshToken, profile, done) => {
    await User.findOne({ googleId: profile.id }, async (err, user) => {
      if(user){
        await user.generateToken();
        console.log(user);
        return done(null, profile);
      }else{
        const nUser = new User({
          googleId: profile.id,
          username: profile.displayName
        });
        await nUser.generateToken();
        await nUser.save();
        console.log(user);
        return done(null, nUser);
      }
    });
  })
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user)
    
  });

router.get("/adg",
    passport.authenticate('google', { scope: ['email'] }),
  );

  router.get('/adg/verified', 
  passport.authenticate('google', { failureRedirect: '/users/login' }),
  async (req, res) => {
    
    const foundUser = req.user;
    
    res.send({foundUser})
  });

module.exports = router;