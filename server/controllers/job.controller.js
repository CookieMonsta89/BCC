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
  job.owner.phoneNumber = job.owner.phoneNumber.match(/\d/g).map(Number).join('');
  return await Job.updateOne({ number: job.number }, job);
}


async function getAll() {
  return await Job.find().sort({ identifier: 'asc' });
}

async function getOne(jobNumber) {
  return await Job.findOne({ number: jobNumber });
}
