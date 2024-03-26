const express = require('express');
const router = express.Router();
const {RegisterUser, LoginUser} = require('./../controllers/authController');


//route to handel user registeration
router.post('/register', RegisterUser);
router.post('/login', LoginUser);

module.exports = router;