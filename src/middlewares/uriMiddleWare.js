const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


module.exports = (req, res, next) => {
    try {
      const token = req.params.token;
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
      req.params.userId = decodedToken.userId;
      next();
    } catch (error) {
      res.status(401).send({
        message: "Auth failed",
        success: false,
      });
    }
  };
  