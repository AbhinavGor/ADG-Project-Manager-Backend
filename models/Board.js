const mongoose = require('mongoose')

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
    cards: [],
    members: [],
    createdOn: {
        type: Date,
        default: Date.now
    }
})

const Board = mongoose.model("Board", BoardSchema);

module.exports = Board;