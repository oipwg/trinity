// Import each command
const Rent = require('./Rent');
// import Pools from './Pools'
const RentalProvider = require('./RentalProvider');
// import Wallet from './Wallet'
// import Info from './info'
const SpartanBot = require('spartanbot').SpartanBot;
const spartan = new SpartanBot();

// An array of all the supported commands
// export const INPUT = [Rent, Pools, RentalProvider, Wallet, Info]
const INPUT = [Rent, RentalProvider];

module.exports = function(options) {
    console.log('From root index file spartanBot ', options);

    switch ('case') {
        case 'add':
            console.log('add hit');
            break;
        case 'add':
            console.log('add hit');
            break;
    }
    // Rent({ SpartanBot: spartan });
    // For each Command in the COMMANDS array
    for (let input of INPUT) {
        // console.log(input)
        this.command = INPUT;
    }
};
