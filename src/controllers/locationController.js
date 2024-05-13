const mongoose = require("mongoose");
const User = require('./../models/userModel');
const Location = require('./../models/locationModel');
const Bitmoji= require('./../models/bitmojiModel');
const fs = require('fs').promises;
const path = require('path');
const { BASE_URL } = require("../constants");


const shareLocation = async(req, res) => {
    try {
        const user = req.params.userId;
        const {latitude, longitude, shareWith, bitmoji, description} = req.body;

        if(latitude == undefined){
            return res.status(400).json({message: 'latitude is missing'});
        }
        if(longitude == undefined){
            return res.status(400).json({message: 'longitude is missing'});
        }
        if(description == undefined){
            return res.status(400).json({message: 'description is missing'});
        }
        if(shareWith == undefined){
            return res.status(400).json({message: 'shareWith is missing'});
        }
        if(!Array.isArray(shareWith)){
            return res.status(400).json({message: 'shareWith should be array of objectIDs'});
        }
        if(!bitmoji){
            return res.status(400).json({message: 'bitmoji is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(bitmoji)){
            return res.status(400).json({message: 'Invalid bitmoji'});
        }

        const profile = await User.findById(user);
        if(!profile){
            return res.status(404).json({message: 'User not found'});
        }
        const areValidObjectIDs = shareWith.every(userId => mongoose.Types.ObjectId.isValid(userId));

        if(!areValidObjectIDs){
            return res.status(400).json({message: "One or more Id's of shareWith is Invalid"});
        }

        const avatar = await Bitmoji.findById(bitmoji);
        if(!avatar){
            return res.status(404).json({message: 'Bitmoji not found'});
        }

        let location = await Location.findOne({user});
        if(location){
            return res.status(403).json({message: 'Location already shared in 24hrs. Delete previous location before sharing new'});
        }

        // shareWith.push(user);
        location = new Location({user, latitude, longitude, description, shareWith, bitmoji: avatar.photo});

        await location.save();
        
        return res.status(200).json({message: 'Location shared successfully'});
    } catch (error) {
        console.error('Error in shareLocation:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const deleteLocation = async(req, res) => {
    try {
        const user = req.params.userId;
        await Location.findOneAndDelete({user});
        return res.status(200).json({message: 'Location Deleted successfully'});
    } catch (error) {
        console.error('Error in deleteLocation:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getLocations = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const userId = req.params.userId;
        const locations = await Location.find({shareWith: {$in: [userId]}}).populate('user');

        const data = [];

        locations.forEach((location) => {
            data.push({
                _id:location._id,
                name:location.user.name,
                username:location.user.username,
                description:location.description,
                isVerified:location.user.isVerified,
                profileImageUrl:`${BASE_URL}/api/user/profile/image/${token}/${location.user.profileImageUrl}`,
                bitmoji:`${BASE_URL}/api/location/bitmoji/image/${location.bitmoji}`,
                latitude:location.latitude,
                longitude:location.longitude,
                createdAt:location.createdAt
            })
        });
        res.json(data);
    } catch (error) {
        console.error('Error in getLocations:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getSelfLocation = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const userId = req.params.userId;
        const location = await Location.findOne({user:userId}).populate('user');

        if(!location){
            return res.json(null);
        }
        const data = {
            _id:location._id,
            name:location.user.name,
            username:location.user.username,
            description:location.description,
            isVerified:location.user.isVerified,
            profileImageUrl:`${BASE_URL}/api/user/profile/image/${token}/${location.user.profileImageUrl}`,
            bitmoji:`${BASE_URL}/api/location/bitmoji/image/${location.bitmoji}`,
            latitude:location.latitude,
            longitude:location.longitude,
            createdAt:location.createdAt
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error in getSelfLocation:', error);
        res.status(500).json({message: 'Internal server error'});
    }
} 


const getBitmojis = async(req, res) => {
    try {
        const bitmojis = await Bitmoji.find({});
        const data = [];
        bitmojis.forEach((bitmoji) => {
            data.push({
                _id:bitmoji._id,
                name:bitmoji.name,
                photo:`${BASE_URL}/api/location/bitmoji/image/${bitmoji.photo}`
            })
        })
        res.json(data);
    } catch (error) {
        console.error('Error in getBitmojis:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getBitmojiPhoto = async(req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../uploads/bitmojis', filename);

        await fs.access(filePath);

        res.sendFile(filePath);
    } catch (error) {
        console.error('Error in getBitmojiPhoto:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

module.exports = {shareLocation, getLocations, getBitmojis, getBitmojiPhoto, getSelfLocation, deleteLocation};