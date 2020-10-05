const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const validator = require("validator")

const BoardSchema = new mongoose.Schema({
    boardName: {
        type: String,
        required: true
    },
    createdBy: [{
            name: {
                type: String,
                required: true
            },
            _id: {
                type: String,
                required: true
            }
    }],
    cards: [{
        _id :{
            type: String,
            required: true
        },
        cardName: {
            type: String,
            required: true
        },
        numChecks: {
            type: Number,
            required: true
        },
        description: {
            type: String
        },
        createdBy: [{
            name: {
                type: String,
                required: true
            },
            _id: {
                type: String,
                required: true
            }
        }],
        createdOn: {
            type: Date,
            default: Date.now
        }
    }],
    members: [{
        name: {
            type: String,
            required: true
        },
        _id: {
            type: String,
            required: true
        }
    }],
    createdOn: {
        type: Date,
        default: Date.now
    }
})

const Board = mongoose.model("Board", BoardSchema);

module.exports = Board;