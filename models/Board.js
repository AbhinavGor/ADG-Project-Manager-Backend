const mongoose = require('mongoose')

const BoardSchema = new mongoose.Schema({
    boardName: {
        type: String,
        required: true
    },
    boardDesc: {
        type: String
    },
    lists: [{
        _id: {
            type: String
        },
       listName: {
            type: String
        },
        listDesc: {
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
        cards: [{
            cardName: {
                type: String,
            },
            cardDesc: {
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
                default: Date.now()
            },
            Description: {
                type: String
            },
            Deadline: {
                type: Date
            },
            taskStatus: {
                type: Number,
                default: -1
            }
        }],
        createdOn: {
            type: Date,
            default: Date.now
        }
    }],
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
    members: [],
    createdOn: {
        type: Date,
        default: Date.now
    }
})

const Board = mongoose.model("Board", BoardSchema);

module.exports = Board;