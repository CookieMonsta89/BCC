const jwt = require('jsonwebtoken');
const config = require('../config/config');


module.exports = {
  generateToken
}


function generateToken(user) {
  return jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    data: user,
  }, config.jwtSecret);
}
