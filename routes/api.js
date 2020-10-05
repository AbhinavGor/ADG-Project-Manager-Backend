const express = require('express')
const router = express.Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const { auth, memberAuth, adminAuth } = require("../middleware/auth")

const User = require('../models/User')
const Board = require('../models/Board')

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

  //@route    /api/user/signup
  //@privacy  public
  //@method   POST
  //@res      Register user for THEPC One
  router.post('/user/signup', async (req, res) => {
    const { email, password, password2, name } = req.body;
    
    try {
      const foundUser = await User.findOne({email: email});
      if(foundUser){
        return res.status(500).send({message: `User with email ${email} already exists.`})
      }else if(password !== password2){
        return res.status(500).send({message: "Passwords do not match"});
      }else{
        const newUser = new User({email: email, password: password, username:name});
        await newUser.save();
        await newUser.generateToken();
        return res.status(200).send({message: "Sucessfullly registered."});

      }
    } catch (err) {
        console.log(err);
        res.status(400).send(err);
    }
  });

  //@route    /api/user/login
  //@privacy  puhblic
  //@method   POST
  //@res      login route using form  
  router.post('/user/login', async (req, res) => {
    try {
        const userFound = await User.findByCredentials(req.body.email, req.body.password);
        await userFound.generateToken();

        res.status(200).send(userFound);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);      
    }
  });

  //@route    /api/board/create
  //@privacy  private
  //@method   POST
  router.post('/board/create', auth, async (req, res)=>{
    const { boardName } = req.body;
    const user = req.user;
    const createdBy = {
      name: user.username,
      _id: user._id
    }

    const newBoard = new Board({ boardName, createdBy });
    console.log(user);
    res.status(200).send({newBoard, createdBy});

  })


module.exports = router;