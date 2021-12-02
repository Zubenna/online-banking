const jwt = require("jsonwebtoken");
const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
     const decoded = await jwt.verify(token, process.env.TOKEN_SECRET)
     req.user = decoded;
    //  next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;

