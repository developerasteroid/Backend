const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    content: { //filename of post
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: null
    },
    description: {
        type: String,
        required: true
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {timestamps:true, versionKey:false});

module.exports = mongoose.model('Post', postSchema);
