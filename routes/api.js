const express = require('express')
const router = express.Router()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const { auth, memberAuth, adminAuth } = require("../middleware/auth")

const User = require('../models/User')
const Board = require('../models/Board')
const Card = require('../models/Card')
const List = require('../models/List')

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

  router.get('/user/:id', auth, async (req, res) => {
    const foundUser = await User.findOne( {_id: req.params.id})


    if(!foundUser) {
      res.status(404).send({"message" : "User not found!"})
    }

    res.status(200).send(foundUser);
  })

  //@route    /api/user/login
  //@privacy  puhblic
  //@method   POST
  //@res      login route using form  
  router.post('/user/google', async (req, res) => {
    try {
        const userRec = req.body.profileObj;
        const userFound = await User.findByCredentials(userRec.email);
        if(userFound){
          await userFound.generateToken();
          res.status(200).send(userFound);
        }else{
          const newUser = new User({email: userRec.email, username: userRec.name});
          await newUser.save();
          await newUser.generateToken();
          return res.status(200).send({message: "Sucessfullly registered."});
        }
        
    } catch (err) {
      console.log(err);
      res.status(400).send(err);      
    }
  });

  //@route    /api/board/create
  //@privacy  private
  //@method   POST
  router.post('/board/create', auth, async (req, res)=>{
    const { boardName, boardDesc } = req.body;
    const user = req.user;
    const createdBy = {
      name: user.username,
      _id: user._id
    }

    const newBoard = new Board({ boardName, boardDesc, createdBy });
    await newBoard.save();

    newBoard.members.push(createdBy);
    await newBoard.save();

    res.status(200).send({newBoard});

  })

  //@route    /api/board/:boardID/addMember
  //@privacy  private
  //@method   POST
  router.post('/board/:boardID/addMember', auth, async (req, res) => {
    try {
      const foundBoard = await Board.findById(req.params.boardID);

      if(!foundBoard)
        res.send({'error': `{$req.params.boardID} is an invalid board ID.`});
      
      var isAuth = false;
      for (let index = 0; index < foundBoard.members.length; index++) {
        if(foundBoard.members[index]._id === req.user._id){
          var isAuth = true;
        }        
      }
      if(!isAuth){
        const addUser = {
          name: req.user.username,
          _id: req.user._id
        }
        foundBoard.members.push(addUser);
        foundBoard.save();

        return res.send(foundBoard);
      }else{
        return res.send({error: 'User {req.user.username} with ID {$req.user._id} already exists in the board.'}).status(500);
      }

    } catch (error) {
      console.log(error)
      res.send({error}).status(500)
    }
  })

  //@route    /api/allBoards
  //@privacy  private
  //@method   GET
  router.get('/board/allBoards', auth, async (req, res) => {
    const allBoards = await Board.find();

    res.send({allBoards}).status(200)
  })

  router.get('/users/allUsers', async (req, res) => {
    const allUsers = await User.find();

    res.send({allUsers}).status(200)
  })

  //@route    /api/list/create
  //@privacy  private
  //@method   POST
  router.post('/list/:boardID/create', auth, async (req, res) => {
    const { listName, listDesc } = req.body;
    const boardID = req.params.boardID;
    try {
      const foundBoard = await Board.findById(boardID);
      if(!foundBoard){
        res.status(500).send({"error": `Board with board ID ${boardID} not found!`});
      }
      const user = req.user;
      const createdBy = {
        name: user.username,
        _id: user._id
      }  

      const createdList = new List({
        listName, listDesc, createdBy
      });

      foundBoard.lists.push(createdList);

      await foundBoard.save();

      res.send({foundBoard, createdList, createdBy}).status(200)
    } catch (error) {
        console.log(error)
        res.send({error}).status(500)
    }
    
  })

  router.post('/card/:boardID/:listID/create', auth, async (req, res) => {
    const { cardName, cardDesc } = req.body;
    const boardID = req.params.boardID;
    const listID = req.params.listID;
    try {
      const foundBoard = await Board.findById(boardID);
      const foundList = await foundBoard.lists.findById(listID);
      if(!foundBoard){
        res.status(500).send({"error": `Board with board ID ${boardID} not found!`});
      }

      if(!foundList){
        res.status(500).send({"error": `List in board with board ID ${boardID} and with list ID ${listID} not found!`});
      }
      const user = req.user;
      const createdBy = {
        name: user.username,
        _id: user._id
      }  

      const createdCard = new Card({
        cardName, cardDesc, createdBy
      });

      foundList.lists.push(createdCard);

      await foundBoard.save();

      res.send({foundBoard, createdCard, createdBy}).status(200)
    } catch (error) {
        console.log(error)
        res.send({error}).status(500)
    }
  })

  

module.exports = router;