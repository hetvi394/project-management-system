const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId, expiresIn = '60s') => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn});
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };

 