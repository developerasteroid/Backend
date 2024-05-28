const express = require('express');
const { addNewBitmoji, uploadBitmoji, deleteBitmoji, adminLogin, getApplicationInformation, getUsersList, verifyUser, unverifyUser, getVerifiedUsersList } = require('../controllers/adminController');
const { getBitmojis, getBitmojiPhoto } = require('../controllers/locationController');
const authAdminMiddleWare = require('../middlewares/authAdminMiddleWare');
const uriAdminMiddleWare = require('../middlewares/uriAdminMiddleWare');
const { GetProfileImage } = require('../controllers/profileController');
const router = express.Router();

router.get('/authenticate', authAdminMiddleWare, (req, res) => res.send({message:'Authorized', success:true}))
router.post('/login', adminLogin);

router.get('/app/info', authAdminMiddleWare, getApplicationInformation);
router.post('/app/users', authAdminMiddleWare, getUsersList);
router.post('/app/users/verified', authAdminMiddleWare, getVerifiedUsersList);


router.get('/verify/user/:userId', authAdminMiddleWare, verifyUser);
router.get('/unverify/user/:userId', authAdminMiddleWare, unverifyUser);

router.get('/user/profile/image/:token/:filename', uriAdminMiddleWare, GetProfileImage);
router.get('/user/profile/image/:token', uriAdminMiddleWare, GetProfileImage);

router.post('/bitmoji/add', uploadBitmoji.single('photo'), addNewBitmoji);
router.post('/bitmoji/delete', deleteBitmoji);
// router.get('/get/bitmojis', getBitmojis);
// router.get('/bitmoji/image/:filename', getBitmojiPhoto);

module.exports = router;
