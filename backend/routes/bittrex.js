const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')



const BittrexController = require('../controllers/bittrex')


router.get('/exchangerate', BittrexController.exchangeRate)

router.get('/deposit-addresses', auth, BittrexController.getDepositAddresses)

router.post('/createSell', auth, BittrexController.createSell)

router.get('/openOrders', auth, BittrexController.openOrders)

router.get('/getBalance', auth, BittrexController.getBalance)

router.post('/withdraw', auth, BittrexController.withdraw)

router.post('/cancelOrder', auth, BittrexController.cancelOrder);

router.post('/updateOrder', auth, BittrexController.updateOrder);

module.exports = router