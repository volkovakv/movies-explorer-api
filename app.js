const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const routes = require('./routes');
const error = require('./middlewares/error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

// Слушаем 3000 порт
const { PORT = 3000, DATABASE = 'mongodb://localhost:27017/moviesdb' } = process.env;
const app = express();

mongoose.connect(DATABASE);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(requestLogger);

app.use('/', routes);

app.use(errorLogger);
app.use(errors());
app.use(error);

app.listen(PORT, () => {});
