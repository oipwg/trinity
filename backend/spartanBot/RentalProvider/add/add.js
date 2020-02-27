require('dotenv').config();
// import { config } from 'dotenv'
// config()

const {
    Prompt_MRRAPIKeys,
    Prompt_NiceHashAPIKeys,
    Prompt_CreatePoolProfile,
    Prompt_RentalProviders,
    Prompt_OptionalName,
    Prompt_AddOrCreatePool,
    Prompt_AddPool,
    Prompt_NiceHashCreatePool,
} = require('./promptFunctions');

const { fmtPool, serPool } = require('../../utils');

const MiningRigRentals = 'MiningRigRentals';
const NiceHash = 'NiceHash';

module.exports = async function(options) {
    let spartan = options.SpartanBot;
    let rentalProviders = spartan.getRentalProviders();

    if (rentalProviders.length === 2) {
        let poolArray = await spartan.returnPools();
        console.log('Maximum number of providers reached.');
        return {
            err: 'provider',
            message: 'Maximum number of providers reached.'+ poolArray,
            pool: poolArray.length ? true : false,
            credentials: false,
            success: poolArray.length ? true : false,
        }
    }
        

    let rental_provider_type = options.rental_provider;

    //fn to check existence of a provider
    const checkProviders = provType => {
        for (let prov of rentalProviders) {
            if (prov.getInternalType() === provType) {
                return true;
            }
        }
    };
    let api_answers = options;
    
    if (rental_provider_type === MiningRigRentals) {
        if (checkProviders(MiningRigRentals)) {
            let poolArray = await spartan.returnPools();
     
            console.log(`MiningRigRentals account already exists.
                                Current Limit: 1.`);
            return {
                err: 'provider',
                message: 'MiningRigRentals account already exists. Current Limit: 1.',
                pool: poolArray.length ? true : false,
                credentials: false,
                success: poolArray.length ? true : false,
            }
        }
    } else if (rental_provider_type === NiceHash) {
        if (checkProviders(NiceHash)){
            let poolArray = await spartan.returnPools();
            console.log(
                `NiceHash account already exists. 'Current Limit: 1.'`
            );
            return {
                err: 'provider',
                message: 'NiceHash account already exists. Current Limit: 1.',
                pool: poolArray.length ? true : false,
                credentials: false,
                success: poolArray.length ? true : false,
            }
        }
           
        // api_answers = await Prompt_NiceHashAPIKeys(self, vorpal);
    }


    try {
        let setup_success = await spartan.setupRentalProvider({
            type: rental_provider_type,
            api_key: api_answers.api_key,
            api_secret: api_answers.api_secret,
            // api_id: api_answers.api_id,
            api_id: Date.now(),
            name: options.name === 'undefined'
                    ? undefined
                    : options.name,
        });
        console.log('setup_success:', setup_success)

        if (setup_success.success) {
            spartan.returnPools();
         
            if (setup_success.type === 'MiningRigRentals') {
                //if user has no pools, prompt to create one
                if ( setup_success.poolProfiles.length === 0 ) {
                    let poolData;
                    console.log('options.pool:', options.pool)
                    if (options.pool === 'undefined') return console.log('undefined')
                    

                    createPoolProfile()
                    function createPoolProfile() {

                    }
                    try {
                        //MRRProvider.js in spartanbot
                        poolData = await setup_success.provider.createPoolProfile(
                            options.pool.profileName, options.pool.algo
                        );
                    } catch (err) {
                        console.log(`Error while creating the profile: ${err}`);
                        return {
                            provider: 'MRR',
                            err: 'pool',
                            message: `Error while creating the profile: ${err}`,
                            pool: false,
                            credentials: false,
                            success: false
                        }
                    }

                    if (
                        poolData &&
                        poolData.success &&
                        poolData.success.success
                    ) {
                        setup_success.provider.setActivePoolProfile(
                            poolData.profileID
                        );
                        for (let p of spartan.getRentalProviders()) {
                            if (
                                p.getUID() !== setup_success.provider.getUID()
                            ) {
                                p.addPools(poolData.pool);
                            }
                        }
                        spartan.serialize();
                        console.log(`Pool successfully added`);
                        return {
                            provider: 'Mining Rig Rental',
                            message: `Pool successfully added ${poolData}`,
                            pool: true,
                            credentials: false,
                            success: true
                        }
                    } else {
                        if (poolData === null || poolData === undefined) {
                            console.log(`Pool unsuccessfully added. Pool Data: ${poolData}`)
                            return {
                                provider: 'Mining Rig Rental',
                                err: 'pool',
                                message: `Pool unsuccessfully added. Pool Data: ${poolData}`,
                                pool: false,
                                credentials: true
                            }
                        }
                    }
                } else {
                    let addOrCreatePool = await Prompt_AddOrCreatePool(
                        setup_success.provider
                    );

                    if (addOrCreatePool.option === 'select') {
                        let poolProfiles = setup_success.poolProfiles;

                        let profileArray = [];
                        let profileIDs = [];
                        for (let profile of poolProfiles) {
                            profileArray.push(
                                `Name: ${profile.name} - ID: ${profile.id}`
                            );
                            profileIDs.push(profile.id);
                        }
                        let poolToAdd = await Prompt_AddPool(
                            self,
                            vorpal,
                            profileArray
                        );
                        for (let id of profileIDs) {
                            if (poolToAdd.option.includes(id)) {
                                setup_success.provider.setActivePoolProfile(id);
                                // const len = poolProfiles.length
                                // for (let i = 0; i < len; i++) {
                                // 	if (poolProfiles[i].id === id) {
                                // 		setup_success.provider.addPoolProfiles(poolProfiles[i])
                                // 	}
                                // }
                            }
                        }
                        spartan.serialize();
                    }

                    if (addOrCreatePool.option === 'create') {
                        let poolData;
                        let poolInfo = await Prompt_CreatePoolProfile(
            
                            spartan
                        );
                        try {
                            poolData = await setup_success.provider.createPoolProfile(
                                //Needs to be pool name and pool algo
                                //name, algo
                                poolInfo
                            );
                        } catch (err) {
                            console.log(
                                `Error while creating the profile: ${err}`
                            );
                        }

                        if (
                            poolData &&
                            poolData.success &&
                            poolData.success.success
                        ) {
                            setup_success.provider.setActivePoolProfile(
                                poolData.profileID
                            );
                            for (let p of spartan.getRentalProviders()) {
                                if (
                                    p.getUID() !==
                                    setup_success.provider.getUID()
                                ) {
                                    p.addPools(poolData.pool);
                                }
                            }
                            spartan.serialize();
                            self.log(
                                vorpal.chalk.green(`Pool successfully added`)
                            );
                        } else {
                            if (poolData === null || poolData === undefined) {
                                self.log(
                                    vorpal.chalk.red(
                                        `Pool unsuccessfully added. Pool Data: ${poolData}`
                                    )
                                );
                            }
                        }
                    }
                }
            }
            if (setup_success.type === 'NiceHash') {
                let poolOptions = await Prompt_AddOrCreatePool(
                    self,
                    vorpal,
                    setup_success.provider
                );
                if (poolOptions.option === 'add') {
                    let poolArray = await spartan.returnPools();

                    //if on pools, ask if they want to create one
                    if (poolArray.length === 0) {
                        let confirm = await self.prompt({
                            type: 'confirm',
                            name: 'option',
                            default: true,
                            message: vorpal.chalk.yellow(
                                'Found no pools to add, would you like to create one?'
                            ),
                        });
                        if (confirm.option) {
                            //create pool
                            let NiceHashPool = await Prompt_NiceHashCreatePool(
                         
                                spartan
                            );
                            await spartan.createPool(NiceHashPool);
                            setup_success.provider.setActivePool(
                                NiceHashPool.id
                            );
                            self.log(`Pool Added`);
                        }
                    } else {
                        let fmtPoolArray = [];
                        for (let pool of poolArray) {
                            fmtPoolArray.push(fmtPool(serPool(pool), vorpal));
                        }
                        let poolPicked = await Prompt_AddPool(
                         
                            fmtPoolArray
                        );

                        let poolObject = {};
                        for (let pool of poolArray) {
                            poolObject[fmtPool(serPool(pool), vorpal)] =
                                pool.id;
                        }

                        let poolid = poolObject[poolPicked.option];
                        setup_success.provider.setActivePool(poolid);
                        for (let pool of poolArray) {
                            if (pool.id === poolid) {
                                setup_success.provider.addPools(pool);
                            }
                        }
                    }
                } else if (poolOptions.option === 'create') {
                    //Prompt create Nice Hash pool
                    let NiceHashPool = await Prompt_NiceHashCreatePool(
                        self,
                        vorpal,
                        spartan
                    );
                    await spartan.createPool(NiceHashPool);
                    self.log(`Pool Created`);
                }
            }
            spartan.serialize();
        } else {
            if (setup_success.message === 'settings.api_key is required!') {
                console.log('You must input an API Key!')
                return {
                    err: 'credentials',
                    message: 'settings.api_key is required!',
                    credentials: false
                }
            } else if (setup_success.message === 'settings.api_secret is required!') {
                console.log('You must input an API Secret!')
                return {
                    err: 'credentials',
                    message: 'You must input an API Secret!',
                    credentials: false
                }
            } else if ( setup_success.message === 'Provider Authorization Failed') {
                console.log('Unable to login to Account using API Key & API Secret, please check your keys and try again');
                return {
                    err: 'credentials',
                    message: 'Unable to login to Account using API Key & API Secret, please check your keys and try again',
                    credentials: false
                }
                
            }
        }
    } catch (e) {
      
            console.log('Error! Unable to add Rental Provider!\n' + e)
     
        return {
            err: 'provider',
            message: 'Error! Unable to add Rental Provider!\n' + e,
            credentials: false
        }
    }
};
