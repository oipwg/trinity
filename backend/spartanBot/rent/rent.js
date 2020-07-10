const manualRent = require('./manualRent').manualRent;

const NORMAL = 'NORMAL';
const WARNING = 'WARNING';
const ERROR = 'ERROR';

// Function ran from index.js as a command of Rent
module.exports = async function(options) {
    let spartan = options.SpartanBot;
    console.log('spartan: rent.js 10', spartan.renting)
    if (spartan.renting === false) {
        let msg = {
            userId: options.userId,
            update: false,
            autoRent: false,
            mining: false,
            message: "Your next rental has been stoped.",
            emitter: options.emitter,
            timer: options.Timer,
            name: options.name,
            userOptions: options,
          };
          options.emitter.emit('rented', msg);

    }

        let rental_providers = spartan.getRentalProviders();
        if(rental_providers.length === 0) {
            try {
                let isDeserialzed = await spartan.deserialize()
            } catch (e) {
                console.log('Deserialzed state failed rent.js line 19, Error: ', e)
            }
        }
        

        spartan.onRentalSuccess(() => {});
        spartan.onRentalWarning(() => {});
        spartan.onRentalError(() => {});



        // spartan.emitter.once('RentalFunctionFinish', onRentalFnFinish);

        if (options.rentType === 'Manual') {
            manualRent(options);
        }

        if (options.rentType === 'Spot') {
        }
        //Morphie
        if (options.rentType === 'Tradebot') {

        }

        if (options.rentType === 'Collective Defense') {

        }
};
