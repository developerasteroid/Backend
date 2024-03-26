const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    // Other follower fields...
}, {timestamps:true});

const Follower = mongoose.model('Follower', followerSchema);
