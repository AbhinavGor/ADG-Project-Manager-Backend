const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const validator = require("validator")

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String
    },
    username:{
        type: String
    },
    password:{
        type: String
    },
    email:{
        type:String
    },
    memberType:{
        type: Number,
        default: -1,
        // required: true
    },
    isAdmin:{
        type: Boolean,
        required:true,
        default: false
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    date:{
        type: Date,
        default: Date.now
    }
});

UserSchema.pre("save", async function(next) {
    const user = this
    // console.log("this prints before saving")

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    
    next()

})

UserSchema.statics.findByCredentials = async (email, password) => {
    const findUser = await User.findOne({ email })
    if(!findUser) {
        throw new Error ("Unable to Login!")
    }
    console.log("USer found: " + findUser);
    const isMatch = await bcrypt.compare(password, findUser.password)

    if(!isMatch) {
        throw new Error("Unable to Login!")
    }
    return findUser

}

UserSchema.methods.generateToken = async function () {
    const findUser = this
    const token = jwt.sign({ _id:findUser._id.toString(), memberType:findUser.memberType.toString() }, "ADGPROJMAN")
    
    findUser.tokens = findUser.tokens.concat({ token })
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