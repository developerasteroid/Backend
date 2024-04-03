const express = require('express');
const router = express.Router();
const {GetProfileInfo, GetProfileImage, uploadProfile, updateProfileImage, UpdateProfileInfo} = require('./../controllers/profileController');
const authMiddleWare = require('../middlewares/authMiddleWare');
const uriMiddleWare = require('../middlewares/uriMiddleWare');
const { searchUser } = require('../controllers/userController');


//route to handel user registeration
router.post('/profile/update/upload', authMiddleWare, uploadProfile.single('image'), updateProfileImage);
router.post('/profile/update/details', authMiddleWare, UpdateProfileInfo);
router.get('/profile/image/:token/:filename', uriMiddleWare, GetProfileImage);
router.get('/profile/image/:token', uriMiddleWare, GetProfileImage);
router.get('/profile/:uid', authMiddleWare, GetProfileInfo);
router.get('/profile', authMiddleWare, GetProfileInfo);
router.get('/search/:field', authMiddleWare, searchUser);


module.exports = router;