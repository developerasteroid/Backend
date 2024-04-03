const express = require('express');
const router = express.Router();
const {RegisterUser, LoginUser, UsernameExist} = require('./../controllers/authController');
const authMiddleWare = require('../middlewares/authMiddleWare');


//route to handel user registeration
router.get('/', authMiddleWare, (req, res) => res.send({message:'Authorized', success:true}));
router.post('/register', RegisterUser);
router.post('/login', LoginUser);
router.post('/check/username', UsernameExist);


module.exports = router;