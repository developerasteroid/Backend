const express = require('express');
const app = express();
require("dotenv").config();
const {PORT} = require("./src/constants")
const db_connect = require("./src/config/db_connect");

app.use(express.json());




app.get('/', (req, res) => {
    const token = req.headers.authorization;

    console.log(token);
    res.send("respond from app.js");
});

app.post('/testing', (req, res) => {
    const token = req.headers.authorization;

    console.log(token);
    res.status(409).json({message: 'User with this username already exists'})
});

app.use('/api/auth', require('./src/routes/authRoutes'));


const jwt = require('jsonwebtoken');
app.post('/api/user/getuser', (req, res) => {
    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).json({message: 'Token missing'});
    }


    jwt.verify(token.replace('Bearer ', ''), process.env.jwt_secret, (err, decoded) => {
        if(err) {
            return res.status(401).json({ message: 'Token invalid'});
        } else {
            console.log('Decoded token: ', decoded);


            res.status(200).json({message: 'Protected route accessed'});
        }
    });
});



app.listen(PORT, () =>{
    console.log(`app.js is listening at port ${PORT}`)
});

