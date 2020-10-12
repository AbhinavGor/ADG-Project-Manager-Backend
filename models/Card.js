const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
    cardName: {
        type: String,
        required: true
    },
    cardDescription: {
        type: String,
        required: true
    },
    numChecks: {
        type: Number,
        required: true,
        default: 0
    },
    checkDescription: [{
        details: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false,
            required: true
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
    }]
});

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;