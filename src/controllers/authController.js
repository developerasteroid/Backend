const User = require('./../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const RegisterUser = async(req, res) => {
    try {
        //Extract user input from request body
        const {name, username, password, dateOfBirth, email, mobileNumber} = req.body;

        //check if user with the same username already exists
        let user = await User.findOne({username});
        if (user) {
            return res.status(409).json({message: 'User with this username already exists'})
        }

        //Create new user
        user = new User({name, username, password, dateOfBirth, email, mobileNumber});

        //save user to database
        await user.save();

        //respond with success message
        res.status(201).json({message: 'User registered successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal server error'});
    }
};

const LoginUser = async(req, res) => {
    try {
        // Extract user input from request body
        const { username, password } = req.body;

        // Check if user with the provided username exists
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: '1h' });

        // Respond with token
        res.json({ token });

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Internal server error'});
    }
};

module.exports = {RegisterUser, LoginUser};