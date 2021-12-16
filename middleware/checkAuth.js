const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || '';
  try {
    if (!token) {
      return res.status(401).json('Authorization fail')
    }
    const decrypt = await jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = {
      id: decrypt.id,
      username: decrypt.username,
    };
    next();
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

module.exports = verifyToken;
