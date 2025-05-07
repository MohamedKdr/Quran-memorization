const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    sections: {
        type: Number,
        required: true
    },
    repeats: {
        type: Number,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Session', sessionSchema); 