const { BASE_URL } = require('../constants');
const User = require('./../models/userModel');
const Follower = require('./../models/followerModel');
const Notification = require('./../models/notificationModel');
const FollowRequest = require('./../models/followRequestModel');
const Report = require('./../models/reportModel');
const mongoose = require('mongoose');


const searchUser = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const data = [];
        const name = req.params.field;
        if(!name){
            return res.status(400).json({message: 'name field is required to seaarch user.'})
        }
        let user = await User.findOne({username: name});
        if(user){
            data.push({
                name:user.name,
                username:user.username,
                isVerified:user.isVerified,
                uid:user._id,
                profile:`${BASE_URL}/api/user/profile/image/${token}/${user.profileImageUrl}`
            });
        }

        let users = await User.find({name}).limit(8);
        if(users){
            users.forEach((value) => {
                const foundUser = data.find(obj => obj.username == value.username);

                if(!foundUser){
                    data.push({
                        name:value.name,
                        username:value.username,
                        isVerified:value.isVerified,
                        uid:value._id,
                        profile:`${BASE_URL}/api/user/profile/image/${token}/${value.profileImageUrl}`
                    });
                }
            })
        }

        users = await User.find({ username: { $regex: name, $options: 'i' } }).limit(3);
        if(users){
            users.forEach((value) => {
                const foundUser = data.find(obj => obj.username == value.username);

                if(!foundUser){
                    data.push({
                        name:value.name,
                        username:value.username,
                        isVerified:value.isVerified,
                        uid:value._id,
                        profile:`${BASE_URL}/api/user/profile/image/${token}/${value.profileImageUrl}`
                    });
                }
            })
        }




        users = await User.find({name}).skip(8).limit(10);
        if(users){
            users.forEach((value) => {
                const foundUser = data.find(obj => obj.username == value.username);

                if(!foundUser){
                    data.push({
                        name:value.name,
                        username:value.username,
                        isVerified:value.isVerified,
                        uid:value._id,
                        profile:`${BASE_URL}/api/user/profile/image/${token}/${value.profileImageUrl}`
                    });
                }
            })
        }

        users = await User.find({ username: { $regex: name, $options: 'i' } }).skip(3).limit(10);
        if(users){
            users.forEach((value) => {
                const foundUser = data.find(obj => obj.username == value.username);

                if(!foundUser){
                    data.push({
                        name:value.name,
                        username:value.username,
                        isVerified:value.isVerified,
                        uid:value._id,
                        profile:`${BASE_URL}/api/user/profile/image/${token}/${value.profileImageUrl}`
                    });
                }
            })
        }
        users = await User.find({ name: { $regex: name, $options: 'i' } }).limit(30);
        if(users){
            users.forEach((value) => {
                const foundUser = data.find(obj => obj.username == value.username);

                if(!foundUser){
                    data.push({
                        name:value.name,
                        username:value.username,
                        isVerified:value.isVerified,
                        uid:value._id,
                        profile:`${BASE_URL}/api/user/profile/image/${token}/${value.profileImageUrl}`
                    });
                }
            })
        }

        const resultData = data.filter(obj=> (obj.uid.toString() !== req.params.userId && obj.isBlocked == false));

        
        return res.json(resultData); 
        
    } catch (error) {
        console.error('Error in searchUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getFollowers = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const data = [];
        const userId = req.params.uid || req.params.userId;
        const follower = await Follower.find({userId}).populate('followerId');
        follower.forEach((value)=>{
            data.push({
                name:value.followerId.name,
                username:value.followerId.username,
                isVerified:value.followerId.isVerified,
                uid:value.followerId._id,
                profile:`${BASE_URL}/api/user/profile/image/${token}/${value.followerId.profileImageUrl}`
            });
        })
        res.json(data);

    } catch (error) {
        console.error('Error in getFollowers:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getFollowing = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const data = [];
        const userId = req.params.uid || req.params.userId;
        const follower = await Follower.find({followerId:userId}).populate('userId');
        follower.forEach((value)=>{
            data.push({
                name:value.userId.name,
                username:value.userId.username,
                isVerified:value.userId.isVerified,
                uid:value.userId._id,
                profile:`${BASE_URL}/api/user/profile/image/${token}/${value.userId.profileImageUrl}`
            });
        })
        res.json(data);

    } catch (error) {
        console.error('Error in getFollowing:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const followUser = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.params.userId;

        if(!targetUserId){
            return res.status(400).json({message: 'user ID of Person to be followed is missing'});
        }

        if(!mongoose.Types.ObjectId.isValid(targetUserId)){
            return res.status(400).json({message: 'Invalid target id'});
        }

        if(targetUserId.toString() == userId.toString()){
            return res.status(400).json({message: 'Cannot self Follow. target user id cannot be self id.'});
        }

        //check target user existence
        const targetUser = await User.findById(targetUserId);
        if(!targetUser){
            return res.status(404).json({message: 'Target user not found'});
        }

        //check is target user is already being folllowedd
        const isFollowing = await Follower.findOne({followerId:userId, userId:targetUserId});
        if(isFollowing){
            return res.status(400).json({message: 'User is already followed'});
        }

        if(targetUser.isPrivate){
            const isFollowRequested = await FollowRequest.findOne({requester:userId, recipient:targetUserId});
            if(isFollowRequested){
                return res.status(400).json({message: 'Follow Request was already sent'});
            }
        }

        if(targetUser.isPrivate){
            //for private account
            let followRequest = new FollowRequest({requester:userId, recipient:targetUserId});
            await followRequest.save();

            //create notifiction to notify target
            let notifiction = new Notification({recipient:targetUserId, sender:userId, type:'followRequest', referenceId:followRequest._id});
            await notifiction.save();

            return res.status(200).json({ message: 'Follow request sent successfully' });

        } else {
            //for public account
            let follow = new Follower({followerId:userId, userId:targetUserId});
            await follow.save();
            // Increment followerCount of target user
            await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: 1 } });
            // Increment followingCount of followed user
            await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });

            //create notifiction to notify target
            let notifiction = new Notification({recipient:targetUserId, sender:userId, type:'follow', referenceId:follow._id});
            await notifiction.save();
            return res.status(200).json({ message: 'User followed successfully' });

        }

        
    } catch (error) {
        console.error('Error in followUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const unFollowUser = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.params.userId;

        if(!targetUserId){
            return res.status(400).json({message: 'user ID of Person to be unfollowed is missing'});
        }

        if(!mongoose.Types.ObjectId.isValid(targetUserId)){
            return res.status(400).json({message: 'Invalid target id'});
        }

        if(targetUserId.toString() == userId.toString()){
            return res.status(400).json({message: 'Cannot self unFollow. target user id cannot be self id.'});
        }

        const deleteFollow = await Follower.findOneAndDelete({followerId:userId, userId:targetUserId});

        if(!deleteFollow){
            return res.status(404).json({message: 'Follow record not found. You are not following target user.'});
        }

        // Decrement followerCount of target user
        await User.findByIdAndUpdate(targetUserId, { $inc: { followerCount: -1 } });
        // Decrement followingCount of followed user
        await User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } });

        await Notification.findOneAndDelete({recipient:targetUserId, sender:userId, type:'follow', referenceId:deleteFollow._id});

        return res.status(200).json({message: 'Unfollowed Successfully'});


    } catch (error) {
        console.error('Error in unFollowUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const removeFollower = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.params.userId;

        if(!targetUserId){
            return res.status(400).json({message: 'targetUserId is missing.'});
        }

        if(!mongoose.Types.ObjectId.isValid(targetUserId)){
            return res.status(400).json({message: 'Invalid target id'});
        }

        if(targetUserId.toString() == userId.toString()){
            return res.status(400).json({message: 'target user id cannot be self id.'});
        }

        const deleteFollower = await Follower.findOneAndDelete({followerId:targetUserId, userId:userId});

        if(!deleteFollower){
            return res.status(404).json({message: 'Follower record not found. target user is not following you.'});
        }
        // Decrement followerCount of self
        await User.findByIdAndUpdate(userId, { $inc: { followerCount: -1 } });
        // Decrement followingCount of target user
        await User.findByIdAndUpdate(targetUserId, { $inc: { followingCount: -1 } });

        await Notification.findOneAndDelete({recipient:userId, sender:targetUserId, type:'follow', referenceId:deleteFollower._id});

        return res.status(200).json({message: 'follower removed Successfully'});


    } catch (error) {
        console.error('Error in removeFollower:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const removeFollowRequest = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.params.userId;

        if(!targetUserId){
            return res.status(400).json({message: 'targetUserId is missing.'});
        }

        if(!mongoose.Types.ObjectId.isValid(targetUserId)){
            return res.status(400).json({message: 'Invalid target id'});
        }

        if(targetUserId.toString() == userId.toString()){
            return res.status(400).json({message: 'target user id cannot be self id.'});
        }

        const deleteFollowRequest = await FollowRequest.findOneAndDelete({requester:userId, recipient:targetUserId});
        if(!deleteFollowRequest){
            return res.status(404).json({message: 'Follow request does not exist'});
        }
        await Notification.findOneAndDelete({recipient:targetUserId, sender:userId, type:'followRequest', referenceId:deleteFollowRequest._id});

        return res.status(200).json({message: 'Follow request removed Successfully'});

    } catch (error) {
        console.error('Error in removeFollowRequest:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const acceptFollowRequest = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.params.userId;

        if(!targetUserId){
            return res.status(400).json({message: 'targetUserId is missing.'});
        }

        if(!mongoose.Types.ObjectId.isValid(targetUserId)){
            return res.status(400).json({message: 'Invalid target id'});
        }

        if(targetUserId.toString() == userId.toString()){
            return res.status(400).json({message: 'target user id cannot be self id.'});
        }
        const deleteFollowRequest = await FollowRequest.findOneAndDelete({requester:targetUserId, recipient:userId});
        if(!deleteFollowRequest){
            return res.status(404).json({message: 'Follow request does not exist'});
        }
        //check is target user is already being folllowing
        const isFollowing = await Follower.findOne({followerId:targetUserId, userId:userId});
        if(isFollowing){
            return res.status(400).json({message: 'User is already following'});
        }
        let follow = new Follower({followerId:targetUserId, userId:userId});
        await follow.save();
        // Increment followerCount of user
        await User.findByIdAndUpdate(userId, { $inc: { followerCount: 1 } });
        // Increment followingCount of target user
        await User.findByIdAndUpdate(targetUserId, { $inc: { followingCount: 1 } });

        await Notification.findOneAndDelete({recipient:userId, sender:targetUserId, type:'followRequest', referenceId:deleteFollowRequest._id});

        return res.status(200).json({ message: 'Request accepted successfully' });

    } catch (error) {
        console.error('Error in acceptFollowRequest:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const declineFollowRequest = async(req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.params.userId;

        if(!targetUserId){
            return res.status(400).json({message: 'targetUserId is missing.'});
        }

        if(!mongoose.Types.ObjectId.isValid(targetUserId)){
            return res.status(400).json({message: 'Invalid target id'});
        }

        if(targetUserId.toString() == userId.toString()){
            return res.status(400).json({message: 'target user id cannot be self id.'});
        }

        const deleteFollowRequest = await FollowRequest.findOneAndDelete({requester:targetUserId, recipient:userId});
        if(!deleteFollowRequest){
            return res.status(404).json({message: 'Follow request does not exist'});
        }
        await Notification.findOneAndDelete({recipient:userId, sender:targetUserId, type:'followRequest', referenceId:deleteFollowRequest._id});

        return res.status(200).json({message: 'Follow request declined Successfully'});
    } catch (error) {
        console.error('Error in declineFollowRequest:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const reportUser = async(req, res) => {
    try {
        const selfUID = req.params.userId;
        const {userId, reason} = req.body;
        if(!userId){
            return res.status(400).json({message: 'user id is missing'});
        }
        if(!reason){
            return res.status(400).json({message: 'reason is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({message:'Invalid userId'});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'User not exist'});
        }
        

        

        let report = new Report({userId: selfUID, type: 'user', referenceId: userId, reason});
        await report.save();

        res.status(200).json({message: 'Reported user successfully'});
        
    } catch (error) {
        console.error('Error in reportUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


module.exports = {searchUser, followUser, unFollowUser, removeFollower, removeFollowRequest, acceptFollowRequest, declineFollowRequest, getFollowers, getFollowing, reportUser};