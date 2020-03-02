require('dotenv').config();
// import { config } from 'dotenv'
const fs = require('fs');
const fsPromise = fs.promises;
const storage = process.cwd() +'/localStorage/spartanbot-storage';

// get storage file when app loads, PROBABLY CHANGE WHEN SAVING KEYS AND SECRET PROVIDER TO DATABASE
const getStorage = async () => {
    try {
        const data = await JSON.parse( await fsPromise.readFile(storage, "utf8") )
        return data
    } catch(e) {
        return 'File reader failed: '+ e
    }
}


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
    let storageFile = {}
    getStorage().then((data)=> storageFile.file = data.rental_providers[0]).catch(err => console.log(err))
    
    const storage = storageFile.file

    let spartan = options.SpartanBot;
    let rentalProviders = spartan.getRentalProviders();

    if (rentalProviders.length === 2) {
        let poolArray = await spartan.returnPools();
        console.log('Maximum number of providers reached.');
        return {
            err: 'provider',
            message: 'Maximum number of providers reached.'+ poolArray.length,
            pool: poolArray.length ? true : false,
            credentials: true,
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
                err: poolArray.length ? 'provider' : 'pool',
                message: poolArray.length ? 'Mining Rig Rentals account already exists. Current Limit: 1.'+
                                            'You can move on to setup to rent' : 'No pool found enter pool info below to add a pool',
                pool: poolArray.length ? true : false,
                credentials: true,
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
                err: poolArray.length ? 'provider' : 'pool',
                message: poolArray.length ? 'Nice Hash account already exists. Current Limit: 1.'+
                                            'You can move on to setup to rent' : 'No pool found enter pool info below to add a pool',
                pool: poolArray.length ? true : false,
                credentials: true,
                success: poolArray.length ? true : false,
            }
        }
    }


    try {
        let setup_success = await spartan.setupRentalProvider({
            type: rental_provider_type,
            api_key: api_answers.api_key || storage.api_key,
            api_secret: api_answers.api_secret || storage.api_secret,
            // api_id: api_answers.api_id,
            api_id: Date.now(),
            name: options.name === undefined
                    ? undefined
                    : rental_provider_type,
        });

        if (setup_success.success) {
            spartan.returnPools();
         
            if (setup_success.type === 'MiningRigRentals') {
                //if user has no pools, prompt to create one
                if ( setup_success.poolProfiles.length === 0 ) {
                    let poolData;
                    console.log('options.pool:', options.poolData)
                    if (options.poolData === undefined){
                        return {
                            provider: 'MRR',
                            err: 'pool',
                            message: `No pools found, input pool info below to continue:`,
                            pool: false,
                            credentials: true,
                            success: false
                        }
                    }
                    
                    
                    createPoolProfile()
                    function createPoolProfile() {

                    }
                    try {
                        //MRRProvider.js in spartanbot
                        poolData = await setup_success.provider.createPoolProfile(
                            options.poolDATA.profileName, options.poolData.algo
                        );
                    } catch (err) {
                        console.log(`Error while creating the profile: ${err}`);
                        return {
                            provider: 'MRR',
                            err: 'pool',
                            message: `Error while creating the profile: ${err}`,
                            pool: false,
                            credentials: true,
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
                            credentials: true,
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
            credentials: false,
            pool: false,
            success: false
        }
    }
};
