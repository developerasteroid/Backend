const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        required: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, {versionKey: false});

module.exports = mongoose.model('Like', likeSchema);
