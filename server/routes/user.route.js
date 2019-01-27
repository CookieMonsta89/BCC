const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');
const requireAdmin = require('../middleware/require-admin');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }))

router.get('/', passport.authenticate('jwt', { session: false }), requireAdmin, asyncHandler(getAll));
router.post('/', passport.authenticate('jwt', { session: false }), requireAdmin, asyncHandler(insert));
router.delete('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, asyncHandler(deleteUser));
router.get('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, asyncHandler(getOne));
router.put('/:id', passport.authenticate('jwt', { session: false }), requireAdmin, asyncHandler(update));

async function getAll(req, res) {
  const users = await userCtrl.getAll();
  res.json({ success: true, data: users });
}

async function update(req, res) {
  const result = await userCtrl.update(req.params.id, req.body);
  if (result.ok && result.n >= 1) {
    res.json({ success: true, data: {} });
  } else {
    res.json({ success: false, errors: ['Unable to update user.'] });
  }
}

async function getOne(req, res) {
  const user = await userCtrl.getOne(req.params.id);
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.json({ success: false, errors: ['No user found with that id.'] });
  }
}

async function insert(req, res) {
  let user = await userCtrl.insert(req.body);
  if (user) {
    user = user.toObject();
    delete user.hashedPassword;
    res.json({ success: true, data: { user } });
  } else {
    res.json({ success: false, errors: ['Unable to create user.'] });
  }
}

async function deleteUser(req, res) {
  if (req.user._id.toString() === req.params.id) {
    res.json({ success: false, errors: ['Unable to delete your own user.'] });
  } else {
    let result = await userCtrl.deleteUser(req.params.id);
    if (result.ok && result.n >= 1) {
      res.json({ success: true, data: {} });
    } else {
      res.json({ success: false, errors: ['Unable to delete user.'] });
    }
  }
}
