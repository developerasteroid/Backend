const express = require('express');
const router = express.Router();
const {GetProfileInfo, GetProfileImage, uploadProfile, updateProfileImage, UpdateProfileInfo} = require('./../controllers/profileController');
const authMiddleWare = require('../middlewares/authMiddleWare');
const uriMiddleWare = require('../middlewares/uriMiddleWare');
const { searchUser, followUser, unFollowUser, removeFollowRequest, acceptFollowRequest, getFollowers, getFollowing } = require('../controllers/userController');


//route to handel user registeration
router.post('/profile/update/upload', authMiddleWare, uploadProfile.single('image'), updateProfileImage);
router.post('/profile/update/details', authMiddleWare, UpdateProfileInfo);
router.get('/profile/image/:token/:filename', uriMiddleWare, GetProfileImage);
router.get('/profile/image/:token', uriMiddleWare, GetProfileImage);
router.get('/profile/:uid', authMiddleWare, GetProfileInfo);
router.get('/profile', authMiddleWare, GetProfileInfo);
router.get('/search/:field', authMiddleWare, searchUser);

router.post('/follow', authMiddleWare, followUser);
router.post('/unfollow', authMiddleWare, unFollowUser);
router.post('/follow/request/remove', authMiddleWare, removeFollowRequest);
router.post('/follow/request/accept', authMiddleWare, acceptFollowRequest);
//decline request (need to create)

router.get('/get/followers/:uid', authMiddleWare, getFollowers);
router.get('/get/followers', authMiddleWare, getFollowers);
router.get('/get/following/:uid', authMiddleWare, getFollowing);
router.get('/get/following', authMiddleWare, getFollowing);






module.exports = router;