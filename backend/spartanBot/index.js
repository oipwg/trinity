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

module.exports = async function(options) {
    options.SpartanBot = spartan;

    let to_do = Object.keys(options.to_do)[0];

    // Switch based on user input object
    switch (to_do) {
        case 'rentalProvider':
            let added = await RentalProvider(options).then( added_data => added_data ).catch(err => err);
            return added;
        case 'rent':
            Rent(options);
            break;
    }
};
