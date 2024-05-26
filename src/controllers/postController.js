const Post = require('./../models/postModel');
const User = require('./../models/userModel');
const Like = require('./../models/likeModel');
const Comment = require('./../models/commentModel');
const Notification = require('./../models/notificationModel');
const Follower = require('./../models/followerModel');
const Report = require('./../models/reportModel');
const multer = require('multer');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const resizeImage = require('../utils/imageResize');
const resizeVideo = require('../utils/videoResize');
const DeleteFile = require('../utils/deleteFile');
const { BASE_URL } = require('../constants');



const temporaryPostStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/temp/');
    },
    filename: function (req, file, cb) {
        cb(null, 'POST-' + uuidv4().replace(/-/g, '') + path.extname(file.originalname));
    }
});

const uploadPostFile = multer({ 
    storage: temporaryPostStorage,
    limits: {
        fileSize: 1024 * 1024 * 475 // 475 MB
    }
});

// Custom error handling middleware
const handleMulterUploadPostFileError = (err, req, res, next) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        // File size limit exceeded
        return res.status(400).json({ message: 'File size limit exceeded. max allowed is  475 MB.' });
    }
    if(err instanceof multer.MulterError){
        return res.status(500).json({ message: 'Internal server error' });
    }
    // Pass the error to the default error handler
    next(err);
}








const uplaodPost = async(req, res) => {
    try {
        
        if(!req.file){
            return res.status(400).json({message: 'File is missing'});
        }


        const userId = req.params.userId;
        const {category, location = null, description = ""} = req.body;
        const mimeType = req.file.mimetype;
        let width = 0, height = 0;


        if(!category){
            await DeleteFile(req.file.path);
            return res.status(400).json({message: 'Category is missing'});
        }
        if(!(category == "image" || category == "video")){
            await DeleteFile(req.file.path);
            return res.status(400).json({message: 'Invalid category'});
        }

        //check mimeType support of image
        if(category == "image"){
            if(!(mimeType == 'image/jpeg' || mimeType == 'image/png')){
                await DeleteFile(req.file.path);
                return res.status(400).json({message: 'Unsupported Image Type'});
            }
            let info = await resizeImage( req.file.path, "src/uploads/images/" + req.file.filename, 720);
            await DeleteFile(req.file.path);
            width = info.width;
            height = info.height;
            
        }
        if(category == "video"){
            if(!(mimeType == 'video/mp4' || mimeType == 'video/quicktime' || mimeType == 'video/webm')){
                await DeleteFile(req.file.path);
                return res.status(400).json({message: 'Unsupported Video Type'});
            }

            let duration = await new Promise((resolve, reject) => {
                ffmpeg.ffprobe(req.file.path, (err, metadata) => {
                    if (err) {
                        console.error('Error retrieving video duraton:', err);
                        reject(err);
                    } else {
                        // console.log('Video resizing complete');
                        // console.log('Width:', metadata.streams[0].width);
                        // console.log('Height:', metadata.streams[0].height);
                        resolve(metadata.format.duration);
                    }
                });
            });

            if(duration > 300){
                await DeleteFile(req.file.path);
                return res.status(400).json({message: 'Video duration must be less then 5 Minutes'});
            }


            let info = await resizeVideo(req.file.path, "src/uploads/videos/" + req.file.filename, 620);
            width = info.streams[0].width;
            height = info.streams[0].height;
            await DeleteFile(req.file.path);

            



        }

        const post = new Post({author:userId, category, content: req.file.filename, mimeType, location, description, width, height});

        await post.save();

        // increment post count
        await User.findByIdAndUpdate(userId, { $inc: { postCount: 1 } });

        res.status(201).json({message: 'Posted successfully'});
    } catch (error) {
        console.error('Error in uplaodPost:', error);
        await DeleteFile(req.file.path);
        res.status(500).json({message: 'Internal server error'});
    }
}

const deletePost = async(req, res) => {
    try {
        const userId = req.params.userId;
        const {postId} = req.body;
        const imagePath = "src\\uploads\\images\\";
        const videoPath = "src\\uploads\\videos\\";


        if(!postId){
            return res.status(400).json({message: 'postId is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return res.status(400).json({message: 'Invalid post id'});
        }

        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({message: 'Post does not exist.'});
        }

        if(post.author.toString() != userId.toString()){
            return res.status(403).json({message: 'You are not authorized to delete this post'});
        }

        await Post.findByIdAndDelete(postId);

        // decrement post count
        await User.findByIdAndUpdate(userId, { $inc: { postCount: -1 } });

        if(post.category == 'image'){
            await DeleteFile(imagePath + post.content); 
        } else if(post.category == 'video'){
            await DeleteFile(videoPath + post.content); 
        } 


        const likes = await Like.find({postId}).select('_id');
        const comments = await Comment.find({postId}).select('_id');

        await Like.deleteMany({postId});
        await Comment.deleteMany({postId});

        const likeIds = likes.map(like => like._id);
        const commentIds = comments.map(comment => comment._id);

        await Notification.deleteMany({
            $or: [
                { referenceId: { $in: likeIds }, type: 'like', recipient: post.author },
                { referenceId: { $in: commentIds }, type: 'comment', recipient: post.author }
            ]
        });

        res.status(200).json({message: 'Post deleted successfully'});
    } catch (error) {
        console.error('Error in deletePost:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}



const likePost = async(req, res) => {
    try {
        const userId = req.params.userId;
        const postId = req.params.postId;
        if(!postId){
            return res.status(400).json({message: 'post id is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return res.status(400).json({message: 'Invalid post id'});
        }
        let post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({message: 'Post does not exist.'});
        }

        let isLiked = await Like.findOne({postId, userId});

        if(isLiked){
            return res.status(200).json({message: "Already Liked the post"});
        }

        let like = new Like({postId, userId});
        await like.save();

        await Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 }});

        let notifiction = new Notification({recipient:post.author, sender:userId, type:'like', referenceId:like._id});
        await notifiction.save();

        return res.status(200).json({message: "Liked the post Successfully"});

    } catch (error) {
        console.error('Error in likePost:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const disLikePost = async(req, res) => {
    try {
        const userId = req.params.userId;
        const postId = req.params.postId;
        if(!postId){
            return res.status(400).json({message: 'post id is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return res.status(400).json({message: 'Invalid post id'});
        }


        let isLiked = await Like.findOneAndDelete({postId, userId});

        if(!isLiked){
            return res.status(404).json({message: 'You have not liked the post to dislike'});
        }

        let post = await Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 }});
        
        if(post){
            await Notification.findOneAndDelete({recipient:post.author, sender:userId, type:'like', referenceId:isLiked._id});
        }

        return res.status(200).json({message: "DisLiked the post Successfully"});

    } catch (error) {
        console.error('Error in disLikePost:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const commentPost = async(req, res) => {
    try {
        const userId = req.params.userId;
        const {postId, content} = req.body;
        if(!postId){
            return res.status(400).json({message: 'post id is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return res.status(400).json({message: 'Invalid post id'});
        }
        if(!content){
            return res.status(400).json({message: 'content is missing'});
        }
        let post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({message: 'Post does not exist.'});
        }

        

        

        let comment = new Comment({postId, userId, content});
        await comment.save();

        await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 }});

        let notifiction = new Notification({recipient:post.author, sender:userId, type:'comment', referenceId:comment._id});
        await notifiction.save();

        return res.status(200).json({message: "commented Successfully"});

    } catch (error) {
        console.error('Error in commentPost:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const deleteCommentPost = async(req, res) => {
    try {
        const userId = req.params.userId;
        const {commentId} = req.body;

        if(!commentId){
            return res.status(400).json({message: 'comment id is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(commentId)){
            return res.status(400).json({message: 'Invalid comment id'});
        }

        let comment = await Comment.findById(commentId);

        if(!comment){
            return res.status(404).json({message: 'Comment does not exist.'});
        }

        if(comment.userId.toString() != userId.toString()){
            return res.status(403).json({message: 'You are not authorized to delete this comment'});
        }

        await Comment.findByIdAndDelete(commentId);

        let post = await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 }});
        
        if(post){
            await Notification.findOneAndDelete({recipient:post.author, sender:userId, type:'comment', referenceId:commentId});
        }

        return res.status(200).json({message: "Deleted the Comment Successfully"});


    } catch (error) {
        console.error('Error in deleteCommentPost:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}
 


const servePosts = async(req, res) => {
    try {
        const userId = req.params.userId;
        const token = req.headers.authorization.split(" ")[1];

        const data = [];
        const following = await Follower.find({followerId: userId}).select('userId');
        const followingList = following.map((follow) => follow.userId);
        const posts = await Post.find({author: {$in: followingList}}).populate('author').sort({ createdAt: -1 });
        for(let post of posts){
            let content = "";
            if(post.category == 'video'){
                content = `${BASE_URL}/api/post/content/${token}/video/${post.content}`;
            } else {
                content = `${BASE_URL}/api/post/content/${token}/image/${post.content}`;
            }
            const isLiked = await Like.findOne({userId, postId:post._id});
            data.push({
                _id:post._id,
                name:post.author.username,
                isVerified:post.author.isVerified,
                profile: `${BASE_URL}/api/user/profile/image/${token}/${post.author.profileImageUrl}`,
                content: content,
                category: post.category,
                width: post.width,
                height: post.height,
                liked: (isLiked ? true : false),
                caption: post.description,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                createdAt: post.createdAt
            })
        }
        res.json(data);
    } catch (error) {
        console.error('Error in servePosts:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const serveUserPosts = async(req, res) => {
    try {
        const userId = req.params.userId;
        const uid = req.params.uid;
        const token = req.headers.authorization.split(" ")[1];

        if(!uid){
            return res.status(400).json({message:'uid is missing'});
        }

        if(!mongoose.Types.ObjectId.isValid(uid)){
            return res.status(400).json({message:'Invalid uid'});
        }

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message:'User not found'});
        }

        const data = [];
        const posts = await Post.find({author: uid}).populate('author').sort({ createdAt: -1 });
        for(let post of posts){
            let content = "";
            if(post.category == 'video'){
                content = `${BASE_URL}/api/post/content/${token}/video/${post.content}`;
            } else {
                content = `${BASE_URL}/api/post/content/${token}/image/${post.content}`;
            }
            const isLiked = await Like.findOne({userId, postId:post._id});
            data.push({
                _id:post._id,
                name:post.author.username,
                isVerified:post.author.isVerified,
                profile: `${BASE_URL}/api/user/profile/image/${token}/${post.author.profileImageUrl}`,
                content: content,
                category: post.category,
                width: post.width,
                height: post.height,
                liked: (isLiked ? true : false),
                caption: post.description,
                likeCount: post.likeCount,
                commentCount: post.commentCount,
                createdAt: post.createdAt
            })
        }
        res.json(data);
    } catch (error) {
        console.error('Error in servePosts:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}


const servePostContent = async(req, res) => {
    try {
        const filename = req.params.filename;
        const category = req.params.category;
        if(!filename){
            return res.status(400).json({message: 'filename is missing'});
        }
        if(!category){
            return res.status(400).json({message: 'category is missing'});
        }
        const postPath = category == "video" ? '../uploads/videos' : '../uploads/images';
        const filePath = path.join(__dirname, postPath, filename); // Construct file path using path.join
        try {
            await fs.access(filePath);
            res.sendFile(filePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({message: 'post content does not exist'});
                
            } else {
                console.error('Error accessing file(servePostContent):', error);
                res.status(500).json({message: 'Internal server error'});
            }
        }
    } catch (error) {
        console.error('Error in servePostContent:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const servePostComment = async(req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const postId = req.params.postId;
        if(!postId){
            return res.status(400).json({message: 'post id is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return res.status(400).json({message:'Invalid postId'});
        }

        const data = [];
        const comments = await Comment.find({postId}).populate('userId').sort({ createdAt: -1 });

        for (let comment of comments){
            data.push({
                _id: comment._id,
                postId: comment.postId,
                username: comment.userId.username,
                // name: comment.userId.name,
                userId: comment.userId._id,
                profileImageUrl: `${BASE_URL}/api/user/profile/image/${token}/${comment.userId.profileImageUrl}`,
                content: comment.content,
                createdAt: comment.createdAt
            })
        }
        // console.log(comments);
        res.json(data);
        
    } catch (error) {
        console.error('Error in servePostComment:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const reportPost = async(req, res) => {
    try {
        const userId = req.params.userId;
        const {postId, reason} = req.body;
        if(!postId){
            return res.status(400).json({message: 'post id is missing'});
        }
        if(!reason){
            return res.status(400).json({message: 'reason is missing'});
        }
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return res.status(400).json({message:'Invalid postId'});
        }

        let post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({message: 'Post does not exist.'});
        }

        let report = new Report({userId, type: 'post', referenceId: postId, reason});
        await report.save();

        res.status(200).json({message: 'Reported post successfully'});
        
    } catch (error) {
        console.error('Error in reportPost:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

module.exports = {uploadPostFile, handleMulterUploadPostFileError, uplaodPost, deletePost, likePost, disLikePost, commentPost, deleteCommentPost, servePosts, serveUserPosts, servePostContent, servePostComment, reportPost};