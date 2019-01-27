const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const config = require('../config/config');

const router = express.Router();
module.exports = router;

router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

function login(req, res) {
  if (req.user) {
    let user = req.user;
    let token = authCtrl.generateToken(user);
    res.json({success: true, data: { user, token } });
  } else {
    res.json({success: false, errors: ['Unable to verify user and login.'] });
  }
}
