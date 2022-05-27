const jwt = require('jsonwebtoken');
const IdError = require('../error/IdError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new IdError('Ошибка авторизации: токен не начинается с Bearer');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, `${NODE_ENV === 'production' ? JWT_SECRET : 'eb28135ebcfc17578f96d4d65b6c7871f2c803be4180c165061d5c2db621c51b'}`);
  } catch (err) {
    next(new IdError('Ошибка авторизации: не получилось верифицировать токен'));
  }

  req.user = payload;

  next();
};
