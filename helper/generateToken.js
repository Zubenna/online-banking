const jwt = require("jsonwebtoken");
 
const generateToken = (res, id, username) => {
  const expiration = "2h";
  const token = jwt.sign({ id, username },
   process.env.TOKEN_SECRET,
  {
    expiresIn: '1hr',
  });
  return res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false,
    httpOnly: true,
  });
};

module.exports = generateToken