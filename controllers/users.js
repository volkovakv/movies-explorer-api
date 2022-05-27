const { JWT_SECRET, NODE_ENV } = process.env;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const RequestError = require('../error/RequestError');
const NotFoundError = require('../error/NotFoundError');
const ExistEmailError = require('../error/ExistEmailError');

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    }))
    .then((({ _id }) => User.findById(_id)))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new RequestError('Переданы некорректные данные');
      }
      if (err.code === 11000) {
        throw new ExistEmailError('Пользователь с таким email уже существует');
      }
      next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, `${NODE_ENV === 'production' ? JWT_SECRET : 'eb28135ebcfc17578f96d4d65b6c7871f2c803be4180c165061d5c2db621c51b'}`, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь по указанному _id не найден');
    })
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFoundError('Пользователь с указанным _id не найден');
    })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        throw new RequestError('Переданы некорректные данные');
      }
      if (err.code === 11000) {
        throw new ExistEmailError('Пользователь с таким email уже существует');
      }
      next(err);
    })
    .catch(next);
};
