const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 3000 || 5000;

const APIRouter = require('./routes/api')

app.use(express.json())
app.use(cors())

//DB Config
const db = "mongodb+srv://Abhinav123:Abhinav123@project-manager.ckyoe.mongodb.net/Project-Manager?retryWrites=true&w=majority"
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("MONGDB Connected!!")
}).catch((e) => {console.log("Unable to connect to MongoDB :'(.")})

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(session({
    secret: 'THISISASESSIONSECRET',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 6000}
}))

//PassportJS setup
app.use(passport.initialize())
app.use(passport.session())

app.use("/api", APIRouter);

app.listen(PORT, () => {
    console.log(`Server is walking on port: ${PORT}.`)
})
