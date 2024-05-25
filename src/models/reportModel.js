const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type:{
        type: String,
        enum: ['post', 'user'],
        required: true
    },
    referenceId:{
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['processing', 'resolved', 'declined'],
        default: 'processing'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{versionKey:false});

module.exports = mongoose.model('Report', reportSchema);