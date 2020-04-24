const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')



const BittrexController = require('../controllers/bittrex')


router.get('/exchangerate', BittrexController.exchangeRate)

router.get('/deposit-addresses', auth, BittrexController.getDepositAddresses)

router.get('/deposit-history', auth, BittrexController.getDepositHistory)

router.post('/createSellOrder', auth, BittrexController.createSellOrder)

router.get('/openOrders', auth, BittrexController.openOrders)

router.get('/salesHistory', auth, BittrexController.salesHistory)

router.get('/getBalance', auth, BittrexController.getBalance)

router.post('/withdraw', auth, BittrexController.withdraw)

router.post('/cancelOrder', auth, BittrexController.cancelOrder);

router.post('/updateOrder', auth, BittrexController.updateOrder);

router.post('/createBuyOrder', auth, BittrexController.createBuyOrder);


module.exports = router