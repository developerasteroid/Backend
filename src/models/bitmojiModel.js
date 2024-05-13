const mongoose = require('mongoose');

const bitmojiSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    photo:{
        type: String,
        required: true
    }
}, {versionKey:false});

module.exports = mongoose.model('Bitmoji', bitmojiSchema);