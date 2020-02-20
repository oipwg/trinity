const express = require('express');
const router = express.Router();
router.get('/', function(req, res) {
    console.log('hit');
    // res.sendFile('index.html');
});

module.exports = router;
