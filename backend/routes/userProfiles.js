const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')



const ProfileController = require('../controllers/userProfiles')


router.post('/new', auth, ProfileController.new)

router.post('/update', auth, ProfileController.update)

router.get('/get', auth, ProfileController.get)

router.delete('/delete/:_id', auth, ProfileController.delete)


module.exports = router