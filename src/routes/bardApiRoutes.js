const express = require('express');
const router = express.Router();
const authMiddleWare = require('../middlewares/authMiddleWare');
const { bardApiHandler } = require('../controllers/bardApiController');


router.get('/', authMiddleWare, bardApiHandler);


module.exports = router;