const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    username: {
        type:String,
        required:true,
        lowercase:true,
        unique:true
    },
    password: {
        type:String,
        required:true
    },
    dateOfBirth: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    mobileNumber: {
        type:String,
        required:true
    },
    country: {
        type:String,
        default:null
    },
    profileImageUrl: {
        type:String,
        default:null
    },
    profession: {
        type:String,
        default:null
    },
    bio: {
        type:String,
        default:null
    },
    followerCount: {
        type:Number,
        default:0
    },
    followingCount: {
        type:Number,
        default:0
    },
    postCount: {
        type:Number,
        default:0
    },
    isVerified: {
        type:Boolean,
        default:false
    },
    isBlocked: {
        type:Boolean,
        default:false
    },
    blockedUntil: {
        type:Date,
        default:null
    },
    isPrivate: {
        type:Boolean,
        default:false
    },
    lastLogin: {
        type:Date,
        default:null
    }
}, {timestamps:true});



// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model('User', userSchema);