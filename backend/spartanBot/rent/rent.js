const manualRent = require('./manualRent').manualRent;

const NORMAL = 'NORMAL';
const WARNING = 'WARNING';
const ERROR = 'ERROR';

// Function ran from index.js as a command of Rent
module.exports = async function(options) {
    console.log('RENT .JS SPARTANBOT HIT')
    let spartan = options.SpartanBot;

        let rental_providers = spartan.getRentalProviders();

        // *** UNCOMMENT WHEN DONE WITH RENTING ***
        // if (rental_providers.length === 0) {
        //     return console.log(
        //         'No Rental Providers were found! Please run ' +
        //             'rentalprovider add' +
        //             ' to add your API keys.'
        //     );
        // }

        spartan.onRentalSuccess(() => {});
        spartan.onRentalWarning(() => {});
        spartan.onRentalError(() => {});

        function onRentalFnFinish(rental_info) {
            switch (rental_info.status) {
                case NORMAL:
                    console.log(`Rental was a success!`);
                    break;
                case WARNING:
                    console.log(`Status: Warning`);
                    break;
                case ERROR:
                   console.log( `There was an error attempting to rent.` );
                    console.log(rental_info);
                    break;
                default:
                    console.log('Rental info not of expected type!');
            }
    
        }

        spartan.emitter.once('RentalFunctionFinis', onRentalFnFinish);

        if (options.rentType === 'Manual') {
             let manual = await manualRent(options);
     
        }

        if (rentType === 'Spot') {
        }
        //Morphie
        if (rentType === 'Tradebot') {

        }

        if (rentType === 'Collective Defense') {

        }
};
