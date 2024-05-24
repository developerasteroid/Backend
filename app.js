const express = require('express');
const app = express();
require("dotenv").config();
const {PORT, BASE_URL} = require("./src/constants")
const db_connect = require("./src/config/db_connect");
const cors = require('cors');

// app.use(require('express-status-monitor')());
app.use(cors());

app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));




app.get('/', (req, res) => {
    res.send("Ready to Serve🚀");
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/user', require('./src/routes/userRoutes'));
app.use('/api/post', require('./src/routes/postRoutes'));
app.use('/api/location', require('./src/routes/locationRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/bardapi', require('./src/routes/bardApiRoutes'));






app.listen(PORT, () =>{
    console.log(`app.js is listening at port ${PORT}`);
    console.log(BASE_URL);
});

