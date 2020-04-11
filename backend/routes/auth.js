require('dotenv').config();
const express = require('express');
const router = express.Router();
const passportConf = require('../passport');
const auth = require('../middleware/auth');
const passport = require('passport');
const passportCoinbase = passport.authenticate('oauth2', { session: false });
const User = require('../models/user');



router.get('/coinbase',
  passport.authenticate('coinbase', {scope: [`wallet:user:read,wallet:user:email,wallet:accounts:read,wallet:payment-methods:read,wallet:buys:read,wallet:buys:create,wallet:transactions:read,wallet:transactions:send,wallet:sells:create,wallet:withdrawals:create`]}
  ),
  function(req, res){
    // The request will be redirected to Coinbase for authentication, so this
    // function will not be called.
  });


// pass code - will spit out token
router.get('/coinbase/callback', auth, passportCoinbase, async (req, res) => {
    try {
        console.log(req);

        return res.status(201).send({ success: req.user.coinbase.accessToken });
    } catch (error) {
        console.log(error);
    }
});

// Just commented it out because it wouldn't let me in
  router.post('/bittrex', async (req, res) => {

    // Change this if you need to, but added this layer incase you are still needing to use adding bittrex on your end another way. 
    let _id = req.user ? req.user.id : req.body.userId

    try {
      const { apiKey, secret } = req.body;
      const user = await User.findById(_id).select('-password');

      if(!user){
        return res.status(404).json({ error: 'User not found' });
      }

      user.bittrex = {
        apiKey,
        secret
      }

      await user.save({validateBeforeSave: false})

      res.status(201).json({ data: {provider: 'Bittrex', credentials: true} })
    } catch (error) {
      console.log(error);
      res.statusCode
    }
})

module.exports = router;
