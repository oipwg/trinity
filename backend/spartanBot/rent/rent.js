const manualRent = require('./manualRent').manualRent;

//This file doesn't exist
// import rentSelector from './manualRentSelector'

const NORMAL = 'NORMAL';
const WARNING = 'WARNING';
const ERROR = 'ERROR';

// Function ran from index.js as a command of Rent
module.exports = async function(options) {

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

        let promptRentType = ['Manual', 'Spot', 'Tradebot', 'Collective Defense']
        let rentType = promptRentType;

        async function interactiveObjectInspection(object) {
            let keys = Object.keys(object);
            // [ 'status', 'message', 'error', 'timestamp', 'unixTimestamp', 'id' ]
      
            let modifiedKeys = [];
            for (let key of keys) {
                modifiedKeys.push(
                    (key += `: ${object[key]}`)
                );
            }

            let promptChoices = modifiedKeys;
            console.log('promptChoices: rent.js 45')

            // let inspectionPrompt = await self.prompt({
            //     type: 'list',
            //     message: 'View your receipt',
            //     name: 'option',
            //     choices: promptChoices,
            // });

            // let param = inspectionPrompt.option;
            // let splited = param.split(':');
            // param = splited[0];
            // if (Array.isArray(object[param]) ||
            //     typeof object[param] === 'object' ) {   
            //     console.log(object[param]);
            // } else {
            //     console.log(object[param]);
            // }
            // await interactiveObjectInspection(object);
        }

        spartan.onRentalSuccess(() => {});
        spartan.onRentalWarning(() => {});
        spartan.onRentalError(() => {});

        async function onRentalFnFinish(rental_info) {
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
            await interactiveObjectInspection(rental_info);
        }
        spartan.emitter.on('RentalFunctionFinish', onRentalFnFinish);

        if (options.rentType === 'Manual') {
            await manualRent(options);
        }

        if (rentType === 'Spot') {
        }
        //Morphie
        if (rentType === 'Tradebot') {

        }

        if (rentType === 'Collective Defense') {

        }
};
