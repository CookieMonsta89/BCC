const bcrypt = require('bcrypt');
const Joi = require('joi');
const Job = require('../models/job.model');

const JobSchema = Joi.object({
  number: Joi.string().required(),
  owner: {
    name: {
      first: Joi.string().required(),
      last: Joi.string().required(),
    },
    email: Joi.string().email(),
    address: {
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipcode: Joi.string().required(),
    },
    phoneNumber: Joi.string().regex(/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).required(),
  },
  project: {
    address: {
      street: Joi.string().empty('').allow(null).optional(),
      city: Joi.string().empty('').allow(null).optional(),
      state: Joi.string().empty('').allow(null).optional(),
      zipcode: Joi.string().empty('').allow(null).optional(),
    },
    estimateDate: Joi.date().empty('').allow(null).optional(),
    specificationDate: Joi.date().empty('').allow(null).optional(),
    commencementDate: Joi.date().empty('').allow(null).optional(),
    approxWorkingDays: Joi.number().empty('').allow(null).optional().integer().min(0),
    price: Joi.number().empty('').allow(null).optional().min(0),
    downPayment: {
      percentage: Joi.number().empty('').allow(null).optional().integer().min(0).max(100),
    }
  }
});


module.exports = {
  insert,
  getAll,
  getOne,
  update,
}

async function insert(job) {
  job = await Joi.validate(job, JobSchema, { abortEarly: false });
  job.owner.phoneNumber = job.owner.phoneNumber.match(/\d/g).map(Number).join('');
  return await new Job(job).save();
}

async function update(job) {
  job = await Joi.validate(job, JobSchema, { abortEarly: false });
  if (job.owner && job.owner.phoneNumber) {
    job.owner.phoneNumber = job.owner.phoneNumber.match(/\d/g).map(Number).join('');
  }
  console.log(job);
  return await Job.updateOne({ number: job.number }, job);
}


async function getAll() {
  return await Job.find().sort({ identifier: 'asc' });
}

async function getOne(jobNumber) {
  return await Job.findOne({ number: jobNumber });
}
