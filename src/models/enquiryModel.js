const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    email:{
        type:String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['pending', 'responded'],
        default: 'pending'
    },
    read:{
        type:Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{versionKey:false});

module.exports = mongoose.model('Enquiry', enquirySchema);