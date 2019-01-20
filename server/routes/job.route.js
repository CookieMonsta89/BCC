const express = require('express');
const passport = require('passport');
const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const expressions= require('angular-expressions');
const converter = require('number-to-words');
const path = require('path');
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
  let options = { year: 'numeric', month: 'long', day: 'numeric' };
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
  const filename = `${job.identifier} ${today_string}.docx`;

  res.writeHead ( 200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    'Content-disposition': `attachment; filename=${filename}`
    });

    //Load the docx file as a binary
  var content = fs.readFileSync(path.resolve(__dirname, '../contracts/templates', 'BCC Contract Template - v1.docx'), 'binary');

  var zip = new JSZip(content);

  expressions.filters.string_and_number = function(input) {
    if(!input) return input;
    return `${converter.toWords(input)} ( ${input.toLocaleString('en-US')} )`;
  }

  expressions.filters.string_and_dollars = function(input) {
    if(!input) return input;
    return `${converter.toWords(input)} and ${Math.round((input - parseInt(input)) * 100)}/100 Dollars ( ${input.toLocaleString('en-US', { style: 'currency', currency: 'USD'})} )`;
  }

  expressions.filters.date = function(input) {
    if(!input) return input;
    try {
      const d = new Date(input);
      let day = d.getDate();
      let mon = d.getMonth()+1;
      let year = d.getFullYear();
      const date_string = mon+'/'+day+'/'+year;
      return date_string;
    } catch (ex) {
      return undefined;
    }
  }
  expressions.filters.day_of_month_and_year = function(input) {
    if(!input) return input;
    try {
      let options = { month: 'long' };
      const d = new Date(input);
      const date_string = `${d.toLocaleDateString("en-US", options)}, ${d.getFullYear()}`;
      return `${converter.toOrdinal(d.getDate())} day of ${date_string}`;
    } catch (ex) {
      return undefined;
    }
  }

  expressions.filters.long_date = function(input) {
    if(!input) return input;
    try {
      let options = { month: 'long' };
      const d = new Date(input);
      const month_string = d.toLocaleDateString("en-US", options);
      return `${month_string} ${converter.toOrdinal(d.getDate())}, ${d.getFullYear()}`;
    } catch (ex) {
      return undefined;
    }
  }
  var angularParser = function(tag) {
    return {
      get: tag === '.' ? function(s){ return s;} : function(s) {
        return expressions.compile(tag.replace(/(’|“|”)/g, "'"))(s);
      }
    };
  }
  var doc = new Docxtemplater().loadZip(zip).setOptions({parser:angularParser});

  let data = {
      today,
      job: job.toJSON(),
  };
  data.job['project'] = {
    address: {
      street: '123 test st',
      city: 'Testingville',
      state: 'FL',
      zipcode: '80532'
    },
    plans: [{
      description: 'Test desc #1',
      consultant: 'Mr. Test Consultant',
      origination_date: '2017-03-19T03:09:07.665Z',
      revision_date: '2018-07-14T03:09:07.665Z'
    }, {
      description: 'Test desc #2',
      consultant: 'Mrs. Test',
      origination_date: '2017-04-20T07:09:07.665Z',
      revision_date: '2017-06-27T06:09:07.665Z'
    }],
    estimate_date: '2016-05-19T11:09:07.665Z',
    specification_date: '2016-08-21T11:09:07.665Z',
    commencement_date: '2019-10-12T11:09:07.665Z',
    approx_working_days: 1294,
    price: 52316425.14,
    down_payment: {
      percentage: 10,
    },
  };
  data.job['description'] = 'This is a test description. TEST TEST TESTING...';
  // console.log(data);

  //set the templateVariables
  doc.setData(data);

  try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render()
  }
  catch (error) {
      var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
      }
      console.log(JSON.stringify({error: e}));
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
      throw error;
  }

  var buf = doc.getZip().generate({type: 'nodebuffer'});

  fs.writeFileSync(path.resolve(__dirname, '../contracts', filename), buf);

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  res.end(buf);
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
