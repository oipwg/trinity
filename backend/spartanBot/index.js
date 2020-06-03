// Import each command
// import Pools from './Pools'
const rent = require('./rent/rent');
const add = require('./RentalProvider/add/add');
const dailyBudget = require('./RentalProvider/returnSpartanBot.js')
const clearSpartanBot = require('./RentalProvider/clearSpartanBot');
const SpartanBot = require('spartanbot').SpartanBot;
const spartan = new SpartanBot();


module.exports = async function(options) {
    
    options.SpartanBot = spartan;
    
    let to_do = options.to_do
    console.log('to_do:', to_do)

    // Switch based on user input object
    switch (to_do) {
        case 'rent':
            console.log('OPTIONS', options)
            let rented = await rent(options).then((data)=>{
            }).catch(err => err);
                return rented
        case 'add':
            let added = await add(options).then((data)=>{
                return data
            }).catch(err => err);
            return added;
        case 'clearSpartanBot':
            let cleared = clearSpartanBot(options)
            return cleared
            break;
        case 'returnSpartanBot':
            let data = await dailyBudget(options)
            return options
            break;
    }
};
