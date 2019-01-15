const express = require('express');
const passport = require('passport');
const jobCtrl = require('../controllers/job.controller');
const Job = require('../models/job.model');

const router = express.Router();
module.exports = router;

router.get('/', passport.authenticate('jwt', { session: false }), getAll);
router.post('/', passport.authenticate('jwt', { session: false }), insert);
router.get('/:number', passport.authenticate('jwt', { session: false }), getOne);
router.put('/:number', passport.authenticate('jwt', { session: false }), update);

async function getAll(req, res) {
  const jobs = await jobCtrl.getAll();
  res.json({ success: true, data: jobs });
}

async function getOne(req, res) {
  const job = await jobCtrl.getOne(req.params.number);
  res.json({ success: true, data: job });
}

async function insert(req, res) {
  await jobCtrl.insert(req.body).then(data => {
    res.json({ success: true, data });
  }).catch(err => res.json({ success: false, errors: [err.message] }));
}

async function update(req, res) {
  await jobCtrl.update(req.body).then(data => {
    res.json({ success: true, data });
  }).catch(err => res.json({ success: false, errors: [err.message] }));
}
