// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = verified;  
//     next(); 
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
//  };
 
// module.exports = authMiddleware;
// middleware/authMiddleware.js
const User = require('../model/userModel');
const { verifyToken } = require('../utils/jwttoken');

const authenticateJWT = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];   

 
  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;  
    next();  
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};


module.exports = authenticateJWT;