const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const validator = require("validator")

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    memberType:{
        type: Number,
        default: -1,
        required: true
    },
    isAdmin:{
        type: Boolean,
        required:true,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    date:{
        type: Date,
        default: Date.now
    }
});


UserSchema.methods.generateToken = async function () {
    const findUser = this
    const token = jwt.sign({ _id:findUser._id.toString(), memberType:findUser.memberType.toString() }, "ADGPROJMAN")
    
    findUser.tokens = findUser.tokens.concat({ token })
    // console.log("TOKEN ADDED:",findUser)
    await findUser.save()
    return token

}

//Password reset token generation
UserSchema.methods.generatePasswordReset =  function(){
    this.resetPasswordToken = jwt.sign({ _id:this._id.toString() }, "ADGPROJMAN")
    this.resetPasswordExpires = Date.now() + 3600000;
  };

const User = mongoose.model("User", UserSchema);

module.exports = User;