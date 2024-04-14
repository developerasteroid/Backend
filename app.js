const express = require('express');
const app = express();
require("dotenv").config();
const {PORT} = require("./src/constants")
const db_connect = require("./src/config/db_connect");
const cors = require('cors');

app.use(cors());

app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));




app.get('/', (req, res) => {
    res.send("Ready to Serve🚀");
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));




app.listen(PORT, () =>{
    console.log(`app.js is listening at port ${PORT}`)
});

