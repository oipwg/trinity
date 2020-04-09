const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')



const ProfileController = require('../controllers/userProfiles')


router.post('/new', auth, ProfileController.new)


module.exports = router