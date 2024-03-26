const mongoose = require('mongoose');

const blockingSchema = new mongoose.Schema({
    blockerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blockedId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps:true});

module.exports = mongoose.model('blocking', blockingSchema);