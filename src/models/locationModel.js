const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bitmoji: {
        type: String,
        required: true
    },
    description:{
        type: String,
        default: null
    },
    shareWith : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false});

// Define TTL index for the createdAt field, set to expire after 24 hours
locationSchema.index({createdAt: 1}, {expireAfterSeconds: 24 * 60 * 60});


module.exports = mongoose.model('Location', locationSchema);