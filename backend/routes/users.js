require('dotenv').config();
const JWT = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const express = require('express');
const router = express.Router();
const passportConf = require('../passport');
const auth = require('../middleware/auth');

const passport = require('passport');
const passportSignIn = passport.authenticate('local', { session: false });

const signUpValidator = require('../helpers/signUpValidator');

const UsersController = require('../controllers/users');

// Public - token created

router.post('/signup', signUpValidator, UsersController.signUp);

router.post('/login', passportSignIn, UsersController.signIn);

// router.get('/coinbase', UsersController.coinbase);
// router.get('/coinbase/oauth/token', UsersController.coinbase);

// Private - need token
router.post('/changepassword', auth, UsersController.changePassword);

router.get('/user', auth, UsersController.user);

router.post('/validatePassword', auth, UsersController.validatePassword);


module.exports = router;
