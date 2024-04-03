const User = require('./../models/userModel');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/profiles/');
    },
    filename: function (req, file, cb) {
        cb(null, 'IMG-' + uuidv4().replace(/-/g, '') + path.extname(file.originalname));
    }
});

const uploadProfile = multer({ storage: profileStorage});



const updateProfileImage = async(req, res) => {
    try {
        const userId = req.params.userId;
        // Handle file upload
        if (!req.file) {
            const { image } = req.body;
            if (image == null) {
                try {
                    let updatedUser = await User.findByIdAndUpdate(userId, {profileImageUrl: null} , { new: true });
                    if(updatedUser){
                        return res.json({message:'User Profile Image updated'});
                    }
                    return res.status(401).send({
                        message: 'User not found',
                        success: false,
                    });
                } catch (error) {
                    console.error('Error updating user:', error);
                    throw error;
                }
            } else {
                return res.status(400).json({message:'Provide valid Image data'});
            }
        }

        const profileImageUrl = req.file.filename;
        try {
            let updatedUser = await User.findByIdAndUpdate(userId, {profileImageUrl} , { new: true });
            if(updatedUser){
                return res.json({message:'User Profile Image updated'});
            }
            return res.status(401).send({
                message: 'User not found',
                success: false,
            });
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error in updateProfileImage:', error);
        res.status(500).json({message: 'Internal server error'});
    }
    
}
const UpdateProfileInfo = async(req, res) => {
    try {
        const userId = req.params.userId;
        const {name, username, profession, bio} = req.body;
        let updatedUser = await User.findByIdAndUpdate(userId, {name, username, profession, bio} , { new: true });
        if(updatedUser){
            return res.json({message: 'Profile updated successfully'});
        }
        return res.status(401).send({
            message: 'User not found',
            success: false,
        });

    } catch (error) {
        console.error('Error in UpdateProfileInfo:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const GetProfileInfo = async(req, res) => {
    try {
        const userId = req.params.uid || req.params.userId;

        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({message:'Invalid user ID'});
        }

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.json({
            id:user._id,
            username:user.username,
            name:user.name,
            isVerified:user.isVerified,
            profession:user.profession,
            profileUri:user.profileImageUrl,
            bio:user.bio,
            postCount:user.postCount,
            followerCount:user.followerCount,
            followingCount:user.followingCount
        })
    } catch (error) {
        console.error('Error in GetProfileInfo:', error);
        res.status(500).json({message: 'Internal server error'});
    }

}

const GetProfileImage = async(req, res) => {
    try {
        const filename = req.params.filename || process.env.default_profile;
        const filePath = path.join(__dirname, '../uploads/profiles', filename); // Construct file path using path.join
        const defaultFile = path.join(__dirname, '../uploads/profiles', process.env.default_profile);
        // Check if the file exists asynchronously
        try {
            await fs.access(filePath);
            // File exists, send the file in the response
            res.sendFile(filePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File does not exist
                try {
                    await fs.access(defaultFile);
                    res.sendFile(defaultFile);
                } catch (error) {
                    res.status(404).send('File not found.');
                }
            } else {
                // Other error occurred
                console.error('Error accessing file:', error);
                res.status(500).json({message: 'Internal server error'});
            }
        }
    } catch (error) {
        console.error('Error in GetProfileImage:', error);
        res.status(500).json({message: 'Internal server error'});
    }
    

}

module.exports = {GetProfileInfo, GetProfileImage, uploadProfile, updateProfileImage, UpdateProfileInfo};