const express = require('express')
const router = express.Router()
// console.log(require('../spartanBot/spartanbot.js'))

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.html');
});

module.exports = router;
