const express = require('express');
const passport = require('passport');
const path = require('path');
const officegen = require('officegen');
const fs = require('fs');
const jobCtrl = require('../controllers/job.controller');
const Job = require('../models/job.model');

const router = express.Router();
module.exports = router;

router.get('/', passport.authenticate('jwt', { session: false }), getAll);
router.post('/', passport.authenticate('jwt', { session: false }), insert);
router.get('/:number', passport.authenticate('jwt', { session: false }), getOne);
router.get('/:number/contract', passport.authenticate('jwt', { session: false }), getContract);
router.put('/:number', passport.authenticate('jwt', { session: false }), update);

async function getAll(req, res) {
  const jobs = await jobCtrl.getAll();
  res.json({ success: true, data: jobs });
}

async function getOne(req, res) {
  const job = await jobCtrl.getOne(req.params.number);
  res.json({ success: true, data: job });
}

async function getContract(req, res) {
  const job = await jobCtrl.getOne(req.params.number);
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth()+1;
  let yyyy = today.getFullYear();
  if(dd<10) {
    dd='0'+dd;
  }
  if(mm<10) {
    mm='0'+mm;
  }
  const today_string = mm+'-'+dd+'-'+yyyy;

  res.writeHead ( 200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    'Content-disposition': `attachment; filename=${job.identifier} ${today_string}.docx`
    });

  let docx = officegen('docx');

  docx.on('finalize', function(written) {
    // ...
  });

  docx.on('error', function(err) {
    // ...
  });

  let pObj = docx.createP();
  pObj.options.align = 'center';
  pObj.addText( 'Simple' );
  pObj.addText( ' with color', { color: '000088' } );
  pObj.addText( ' and back color.', { color: '00ffff', back: '000088' } );
  pObj.addText( 'Bold + underline', { bold: true, underline: true } );
  pObj.addText( 'Fonts face only.', { font_face: 'Arial' } );
  pObj.addText( ' Fonts face and size. ', { font_face: 'Arial', font_size: 40 } );
  pObj.addText( 'External link', { link: 'https://github.com' } );

  docx.generate(res);
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
