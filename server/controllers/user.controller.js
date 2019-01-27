const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');

const userCreateSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email(),
  password: Joi.string().required(),
  repeatPassword: Joi.string().required().valid(Joi.ref('password')),
  role: Joi.string().valid(['admin', 'employee', 'customer']),
});

const userUpdateSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email(),
  role: Joi.string().valid(['admin', 'employee', 'customer']),
});


module.exports = {
  insert,
  getAll,
  deleteUser,
  getOne,
  update,
}

async function insert(user) {
  user = await Joi.validate(user, userCreateSchema, { abortEarly: false });
  user.hashedPassword = bcrypt.hashSync(user.password, 15);
  delete user.password;
  delete user.repeatPassword;
  return await new User(user).save();
}

async function getAll() {
  return await User.find({}, '-hashedPassword').sort({ fullname: 'asc' });
}

async function update(userId, user) {
  if (user.password && user.repeatPassword) {
    user = await Joi.validate(user, userCreateSchema, { abortEarly: false });
    user.hashedPassword = bcrypt.hashSync(user.password, 15);
    delete user.password;
    delete user.repeatPassword;
  } else {
    delete user.password;
    delete user.repeatPassword;
    user = await Joi.validate(user, userUpdateSchema, { abortEarly: false });
  }
  return await User.updateOne({ _id: userId }, user);
}

async function deleteUser(userId) {
  return await User.deleteOne({ _id: userId });
}

async function getOne(userId) {
  return await User.findOne({ _id: userId });
}
