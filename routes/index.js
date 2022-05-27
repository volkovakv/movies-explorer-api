const router = require('express').Router();
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../error/NotFoundError');
const { login, createUser } = require('../controllers/users');
const { validationLogin, validationCreateUser } = require('../middlewares/validations');

router.post('/signin', validationLogin, login);
router.post('/signup', validationCreateUser, createUser);

router.use(auth);
router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.use(auth, usersRouter);
router.use(auth, moviesRouter);

router.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
