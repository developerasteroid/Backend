const Bitmoji = require('./../models/bitmojiModel');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const DeleteFile = require('./../utils/deleteFile');
const resizeImage = require('./../utils/imageResize');
const mongoose = require('mongoose'); 
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const Report = require('./../models/reportModel');
const Enquiry = require('./../models/enquiryModel');




const adminLogin = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email){
            return res.status(400).json({message: "email is required"});
        }

        if(!password){
            return res.status(400).json({message: "password is required"});
        }
        if(process.env.ADMIN_LOGIN != 1){
            return res.status(403).json({message: "Forbidden to login"});
        }
        if(email.toLowerCase() != process.env.ADMIN_EMAIL.toLowerCase()){
            return res.status(401).json({message: "Invalid Email or Password"});
        }
        if(password != process.env.ADMIN_PASSWORD){
            return res.status(401).json({message: "Invalid Email or Password"});
        }

        

        // Generate JWT token
        const token = jwt.sign({ email, password }, process.env.jwt_secret, { expiresIn: '1d' });

        res.status(200).json({token});


    } catch (error) {
        console.error('Error in adminLogin:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getApplicationInformation = async(req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalVerifiedUsers = await User.countDocuments({isVerified: true});
        
        const totalReports = await Report.countDocuments({});
        const newReports = await Report.countDocuments({read:false});
        const resolvedReports = await Report.countDocuments({status:'resolved'});
        const declinedReports = await Report.countDocuments({status:'declined'});

        const totalEnquiry = await Enquiry.countDocuments({});
        const newEnquiry = await Enquiry.countDocuments({read:false});
        const respondedEnquiry = await Enquiry.countDocuments({status:'responded'});


        const data = {
            totalUsers,
            totalVerifiedUsers,
            totalReports,
            newReports,
            resolvedReports,
            declinedReports,
            totalEnquiry,
            newEnquiry,
            respondedEnquiry
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in getApplicationInformation:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const getUsersList = async(req, res) => {
    try {
        const {page, search} = req.body;
        const pageSize = 10;
        
        if(!page){
            return res.status(400).json({message: "page number is required"});
        }

        if(search){
            const totalResults = await User.countDocuments({ username: { $regex: search, $options: 'i' } });

            const users = await User.aggregate([
                {
                    $match: { username: { $regex: search, $options: 'i' } }
                },
                {
                    $addFields: {
                        relevance: {
                            $cond: {
                                if: { $eq: [{ $substrCP: ["$username", 0, { $strLenCP: search }] }, search] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                },
                {
                    $sort: { relevance: -1, username: 1 } // Sort by relevance first, then by username alphabetically
                },
                {
                    $skip: (page - 1) * pageSize // Skip the first (page-1) * pageSize documents
                },
                {
                    $limit: pageSize // Limit the results to pageSize documents
                },
                {
                    $project: { username: 1, relevance: 1, _id: 1, name: 1, email: 1, profileImageUrl: 1, followerCount: 1, followingCount: 1, postCount: 1, isVerified: 1, isBlocked: 1, blockedUntil: 1, createdAt: 1 }  // Include only specific fields (e.g., username and relevance)
                }
            ]);

            const totalPages = Math.ceil(totalResults / pageSize);
            return res.json({users, totalPages})
        } else {
            const totalResults = await User.countDocuments({});
            const users = await User.find({}).skip((page - 1) * pageSize).limit(pageSize).select('username relevance _id name email profileImageUrl followerCount followingCount postCount isVerified isBlocked blockedUntil createdAt');
            const totalPages = Math.ceil(totalResults / pageSize);
            return res.json({users, totalPages})
        }
    } catch (error) {
        console.error('Error in getUsersList:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const verifyUser = async(req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId){
            return res.status(400).json({message: "user id is required"});
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({message: "invalid user id"});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "user not exists"});
        }
        await User.findByIdAndUpdate(userId, {isVerified: true});
        res.status(200).json({message:`Verified ${user.username} Successfully`})
    } catch (error) {
        console.error('Error in verifyUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const unverifyUser = async(req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId){
            return res.status(400).json({message: "user id is required"});
        }
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).json({message: "invalid user id"});
        }
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "user not exists"});
        }
        await User.findByIdAndUpdate(userId, {isVerified: false});
        res.status(200).json({message:`Unverified ${user.username} Successfully`})
    } catch (error) {
        console.error('Error in verifyUser:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getVerifiedUsersList = async(req, res) => {
    try {
        const {page, search} = req.body;
        const pageSize = 10;
        
        if(!page){
            return res.status(400).json({message: "page number is required"});
        }

        if(search){
            const totalResults = await User.countDocuments({ username: { $regex: search, $options: 'i' }, isVerified: true });

            const users = await User.aggregate([
                {
                    $match: { username: { $regex: search, $options: 'i' }, isVerified: true }
                },
                {
                    $addFields: {
                        relevance: {
                            $cond: {
                                if: { $eq: [{ $substrCP: ["$username", 0, { $strLenCP: search }] }, search] },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                },
                {
                    $sort: { relevance: -1, username: 1 } // Sort by relevance first, then by username alphabetically
                },
                {
                    $skip: (page - 1) * pageSize // Skip the first (page-1) * pageSize documents
                },
                {
                    $limit: pageSize // Limit the results to pageSize documents
                },
                {
                    $project: { username: 1, relevance: 1, _id: 1, name: 1, email: 1, profileImageUrl: 1, followerCount: 1, followingCount: 1, postCount: 1, isVerified: 1, isBlocked: 1, blockedUntil: 1, createdAt: 1 }  // Include only specific fields (e.g., username and relevance)
                }
            ]);

            const totalPages = Math.ceil(totalResults / pageSize);
            return res.json({users, totalPages})
        } else {
            const totalResults = await User.countDocuments({isVerified:true});
            const users = await User.find({isVerified:true}).skip((page - 1) * pageSize).limit(pageSize).select('username relevance _id name email profileImageUrl followerCount followingCount postCount isVerified isBlocked blockedUntil createdAt');
            const totalPages = Math.ceil(totalResults / pageSize);
            return res.json({users, totalPages})
        }
    } catch (error) {
        console.error('Error in getUsersList:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}




const temporaryBitmojiStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/temp/');
    },
    filename: function (req, file, cb) {
        cb(null, 'BIT-' + uuidv4().replace(/-/g, '') + path.extname(file.originalname));
    }
});

const uploadBitmoji = multer({ storage: temporaryBitmojiStorage});

const addNewBitmoji = async(req, res) => {
    try {
        const {name} = req.body;
        if(!req.file){
            return res.status(400).json({message: 'Bitmoji image is missing'});
        }
        if(!name){
            await DeleteFile(req.file.path);
            return res.status(400).json({message: 'Bitmoji name is missing'});
        }

        await resizeImage(req.file.path, "src/uploads/bitmojis/" + req.file.filename, 150);
        await DeleteFile(req.file.path);

        const bitmoji = new Bitmoji({name, photo: req.file.filename});

        await bitmoji.save();

        res.json({message:'Bitmoji Added Successfully'});

    } catch (error) {
        await DeleteFile(req.file.path);
        console.error('Error in addNewBitmoji:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}



const deleteBitmoji = async(req, res) => {
    try {
        const { bitmoji } = req.body;
        if(!bitmoji){
            return res.status(400).json({message: 'bitmoji ID is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(bitmoji)){
            return res.status(400).json({message: 'Invalid bitmoji ID'});
        }
        const avatar = await Bitmoji.findById(bitmoji);
        if(!avatar){
            return res.status(404).json({message: 'Bitmoji does not exists'});
        }
        await Bitmoji.findByIdAndDelete(bitmoji);
        await DeleteFile("src/uploads/bitmojis/" + avatar.photo);

        res.json({message:'Bitmoji Deleted Successfully'});
    } catch (error) {
        console.error('Error in deleteBitmoji:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

module.exports = {adminLogin, getApplicationInformation, getUsersList, verifyUser, unverifyUser, getVerifiedUsersList, uploadBitmoji, addNewBitmoji, deleteBitmoji};