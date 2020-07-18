const express = require('express');
const router = express.Router();
const Client = require('../spartanBot').Client;
const { getCircularReplacer } = require('../spartanBot/utils')



router.post('/', async (req, res)=> {
    let inputs = req.body

    let options = await Client.controller({
        userName: inputs.name,
        userId: inputs.userId,
        to_do: inputs.to_do
    }) // Attaches SpartanBot to inputs
    // console.log('OPTIONS', {...options, ...inputs})
        if (inputs.whatToDo === 'getRentalValues') {
            let values = await options.autoRentCalculations.niceHashCalculation({...options, ...inputs})
            let replacedCircularData = JSON.stringify(values, getCircularReplacer());

            res.send(replacedCircularData)
        }
})

module.exports = router;