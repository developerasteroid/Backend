const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./../models/userModel');


module.exports = async(req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      }
      const decodedToken = jwt.verify(token, process.env.jwt_secret);
      if(!mongoose.Types.ObjectId.isValid(decodedToken.userId)){
        return res.status(401).send({
          message:'Invalid user ID',
          success: false,
        });
      }
      const user = await User.findById(decodedToken.userId);
      if(!user){
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      }
      if(user.isBlocked){
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      }
      req.params.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).send({
        message: "Auth failed",
        success: false,
      });
    }
  };
  