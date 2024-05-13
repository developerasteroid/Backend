const express = require('express');
const authMiddleWare = require('../middlewares/authMiddleWare');
const { shareLocation, getLocations, getBitmojiPhoto, getBitmojis, getSelfLocation, deleteLocation } = require('../controllers/locationController');
const router = express.Router();

router.post('/share', authMiddleWare, shareLocation);
router.get('/delete', authMiddleWare, deleteLocation);
router.get('/all', authMiddleWare, getLocations);
router.get('/my', authMiddleWare, getSelfLocation);
router.get('/bitmoji/image/:filename', getBitmojiPhoto);
router.get('/get/bitmojis', getBitmojis);

module.exports = router;
