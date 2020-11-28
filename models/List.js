const mongoose = require('mongoose')

const listSchema = new mongoose.Schema({
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
});

const List = mongoose.model("List", listSchema);


module.exports = List;