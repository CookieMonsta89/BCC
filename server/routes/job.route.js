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

  let docx = officegen('docx');

  docx.on('finalize', function(written) {
    // ...
  });

  docx.on('error', function(err) {
    // ...
  });
  let currentPageNumber = 1;
  const totalPages = 13;
  let footer = docx.getFooter().createP();
  footer.options.align = 'center';
  footer.addText ( `Owner  _____    Contractor  _____                      ${filename}                      Page ${currentPageNumber} of ${totalPages}`, { font_face: 'Times New Roman', font_size: 8 });

  let pObj = docx.createP();
  pObj.options.align = 'center';
  pObj.addText( 'CONSTRUCTION CONTRACT – FIXED PRICE', { font_face: 'Times New Roman', font_size: 12, bold: true } );

  pObj = docx.createP();
  pObj.addText( `THIS AGREEMENT, executed on ${today.toLocaleDateString("en-US", options)}`, { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.addText( 'Between the Owner:', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( `${job.owner.name.full}`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `${job.owner.address.street}`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `${job.owner.address.city}, ${job.owner.address.state} ${job.owner.address.zipcode} `, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `${job.owner.email}`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `${job.owner.phoneNumber}`, { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.addText( 'And the Contractor:', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( `Brevard Construction Company`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `David Hicks, Vice President`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `1909 Cocoa Blvd.`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `Cocoa, FL 32922`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `Dhicks@brevardconstruction.com`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `Florida License Numbers RG291103905 & RC29027623`, { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();
  pObj.addText( `321-301-6000`, { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.addText( 'For the Project:', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( 'See attached estimate and specifications for the specific scope of work.', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.addText( 'Construction Lender:', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( 'N/A', { font_face: 'Times New Roman', font_size: 12 } );

  docx.putPageBreak();
  currentPageNumber = currentPageNumber + 1;

  pObj = docx.createP();
  pObj.options.align = 'center';
  pObj.addText( 'ARTICLE 1. CONTRACT DOCUMENTS', { font_face: 'Times New Roman', font_size: 12, bold: true } );

  pObj = docx.createP();
  pObj.addText( '1.1.', { font_face: 'Times New Roman', font_size: 12, bold: true } );
  pObj.addText( '    The Contract Documents consist of this agreement, general conditions, estimate worksheet attached (Estimate), specifications attached (Specifications) and all Change Orders (if any) or modifications issued and agreed to by both parties. All documents noted herein shall be provided to the Owner by the Contractor. These Contract documents represent the entire agreement of both parties and supersede any prior oral or written agreement.', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.align = 'center';
  pObj.addText( 'ARTICLE 2. SCOPE OF WORK', { font_face: 'Times New Roman', font_size: 12, bold: true } );

  pObj = docx.createP();
  pObj.addText( '2.1.', { font_face: 'Times New Roman', font_size: 12, bold: true } );
  pObj.addText( '    The Owner agrees to purchase and the Contractor agrees to construct the above-mentioned Project with fixtures attached thereto in ___________________, County of Brevard and State of Florida, according to this Contract, the attached Estimate, attached Specifications and future agreed upon Change Orders as specified in Article 8.', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( '2.1.1', { font_face: 'Times New Roman', font_size: 12, bold: true } );
  pObj.addText( '    Construction Plans', { font_face: 'Times New Roman', font_size: 12 } );

  var table = [
    [{
      val: "Page Description",
      opts: {
        cellColWidth: 2160,
        b:true,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    },{
      val: "Consultant",
      opts: {
        cellColWidth: 2160,
        b:true,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    },{
      val: "Origination Date",
      opts: {
        cellColWidth: 2160,
        b:true,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    }, {
      val: "Revision Date",
      opts: {
        cellColWidth: 2160,
        b:true,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    }],
    [{
      val: "N/A",
      opts: {
        cellColWidth: 2160,
        b:false,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    }, {
      val: "",
      opts: {
        cellColWidth: 2160,
        b:false,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    }, {
      val: "",
      opts: {
        cellColWidth: 2160,
        b:false,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    }, {
      val: "",
      opts: {
        cellColWidth: 2160,
        b:false,
        sz: '20',
        shd: {
          fill: "FFFFFF",
        },
        fontFamily: "Times New Roman"
      }
    }],
  ]

  var tableStyle = {
    tableColWidth: 2160,
    tableSize: 24,
    tableAlign: "left",
    tableColor: "000000",
    tableFontFamily: "Times New Roman",
    borders: true
  }

  docx.createTable(table, tableStyle);
  pObj = docx.createP();

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( '2.1.2', { font_face: 'Times New Roman', font_size: 12, bold: true } );
  pObj.addText( '    Construction Estimate dated ___________, 20__ attached hereto. The scope of work in this contract is contained there-in.', { font_face: 'Times New Roman', font_size: 12 } );

  pObj = docx.createP();
  pObj.options.indentLeft = 1440; // Indent left 1 inch
  pObj.addText( '2.1.3', { font_face: 'Times New Roman', font_size: 12, bold: true } );
  pObj.addText( '    Specifications dated ___________, 20__ attached hereto. The specifications for this contract are contained there-in.', { font_face: 'Times New Roman', font_size: 12 } );
  pObj.addLineBreak ();

  pObj = docx.createP();
  pObj.options.align = 'center';
  pObj.addText( 'ARTICLE 3. TIME OF COMPLETION', { font_face: 'Times New Roman', font_size: 12, bold: true } );

  pObj = docx.createP();
  pObj.addText( '3.1.', { font_face: 'Times New Roman', font_size: 12, bold: true } );
  pObj.addText( '    The approximate commencement date of the Project shall be ______________ or within seven days after the County issues a permit, whichever is later, and the project should take approximately ______ working days to complete. Completion date is subject to: Change Orders; unusual weather may delay or otherwise affect the completion date; complications with material availability due to no fault of the Contractor; changes in scope of work as addressed in Article 8; Regulatory delays in permitting/inspections not through negligence of the Contractor; or Owner related delays.', { font_face: 'Times New Roman', font_size: 12 } );





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
