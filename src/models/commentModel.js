const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        required: true 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    content: { // comment msg
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false});

module.exports = mongoose.model('Comment', commentSchema);
