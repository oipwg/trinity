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
    options.SpartanBot = spartan;

    // let to_do = options.to_do;
    let to_do = Object.keys(options.to_do)[0];
    console.log('From root index file spartanBot. ', Object.keys(to_do));

    console.log(to_do);
    // Switch based on user input object
    switch (to_do) {
        case 'rentalProvider':
            RentalProvider(options);
            break;
        case 'rent':
            Rent(options);
            break;
    }
};
