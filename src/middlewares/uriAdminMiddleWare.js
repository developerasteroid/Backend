const jwt = require('jsonwebtoken');


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

      if(decodedToken.email.toLowerCase() != process.env.ADMIN_EMAIL.toLowerCase()){
        return res.status(401).send({
          message:'Auth failed',
          success: false,
        });
      }
      if(decodedToken.password != process.env.ADMIN_PASSWORD){
        return res.status(401).send({
          message:'Auth failed',
          success: false,
        });
      }
      req.params.email = decodedToken.email.toLowerCase();
      next();
    } catch (error) {
      res.status(401).send({
        message: "Auth failed",
        success: false,
      });
    }
  };
  