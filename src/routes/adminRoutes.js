const express = require('express');
const { addNewBitmoji, uploadBitmoji, deleteBitmoji } = require('../controllers/adminController');
const { getBitmojis, getBitmojiPhoto } = require('../controllers/locationController');
const router = express.Router();


router.post('/bitmoji/add', uploadBitmoji.single('photo'), addNewBitmoji);
router.post('/bitmoji/delete', deleteBitmoji);
// router.get('/get/bitmojis', getBitmojis);
// router.get('/bitmoji/image/:filename', getBitmojiPhoto);

module.exports = router;
