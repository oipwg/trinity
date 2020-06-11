require('dotenv').config();
const SpartanBot = require('spartanbot').SpartanBot;
const {
    Prompt_NiceHashCreatePool,
} = require('./promptFunctions');


/**
 * Create a pool and add it to local variable
 * @param {Object} options.poolData
 * @param {string} options.poolData.type - Pool algo, eg: sha256, scrypt, x11, etc
 * @param {string} options.poolData.name - Name to identify the pool with
 * @param {string} options.poolData.host - Pool host, the part after stratum+tcp://
 * @param {number} options.poolData.port - Pool port, the part after the : in most pool host strings
 * @param {string} options.poolData.user - Your workname
 * @param {number} [options.poolData.id] - Local ID (NOT MRR ID)
 * @param {string} [options.poolData.pass='x'] - Worker password
 * @param {string} [options.poolData.notes] - Additional notes to help identify the pool for you
 * @async
 * @returns {Promise<Object>}
 */

let addPool = async function(setup_success, options) {
    const provider = setup_success.proivder || setup_success;
  
    let pool;
    for (let p of this.getRentalProviders()) {
        if ( p.getUID() !== provider.getUID() ) {
            p._addPools(options.poolData);
        }
    }
    try {
        if (provider.name === 'NiceHash') pool = await provider._createPool(options.poolData)
        if (provider.name === 'MiningRigRentals') pool = await provider.createPoolAndProfile(options.poolData)
        console.log('pool: 35 add.js', pool)
        
        this.serialize()
        if ( pool.error ) {
            console.log(`Error while creating the profile: ${pool.error}`);
            return {
                provider: options.provider,
                err: 'pool',
                message: `Error while creating the pool: ${pool.data.message}`,
                pool: false,
                credentials: true,
                success: false,
                spartanbot: this
            }
        } else {
            return {
                err: 'pool',
                provider: options.provider,
                rental_provider: options.provider,
                message: `${options.provider} and Pool successfully added, \n` + 
                            `profile id: ${pool.profileID} & pool id: ${pool.poolid} `,
                pool: true,
                credentials: true,
                success: true,
                spartanbot: this
            }
        }
        
    } catch(e) {
        console.log({err: 'Pool unsuccessful add.js line 79 ' + e})
        return {
            provider: options.provider,
            err: 'pool',
            message: `Error while creating the pool: ${e}`,
            pool: false,
            credentials: true,
            success: false,
            spartanbot: this
        }
    }
}


const getCurrentProvider = function(options) {
    if (this.length) {
        return this.filter(provider => {
            if ( provider.name === options.provider) {
                return provider
            }
        })[0]
    }
}

/**
 * Delete a pool
 * @param {(number|string)} id - Pool id
 * @return {Promise<*>}
 */
const deletePool = async function(id){
    let deletedPool = await this.deletePool().then(res => console.log('deletedPool: ',res).catch(err => console.log('Failed to delete ', err)))
}

/**
 * Delete a pool profile
 * @param {(number|string)} id - Profile id
 * @returns {Promise<Object>}
 */
const deletePoolProfile = async function(id = '') {
    let deletedPoolProfile = await this.deletePoolProfile(id).then(res => console.log('deletedPoolProfile: ',res))
}


const MiningRigRentals = 'MiningRigRentals';
const NiceHash = 'NiceHash';

module.exports = async function(options) {
    const spartan = options.SpartanBot;

    let rental_provider_type = options.rental_provider;
    let rentalProviders = spartan.getRentalProviders();

    console.log('rental_provider_type:', rental_provider_type)

    if (rentalProviders.length === 2 && options.poolData === undefined) {
        let providers = spartan.getSupportedRentalProviders();
        let poolCount = 0
        for (let provider of providers) {
            let poolArray = await spartan.returnPools(provider);
            poolCount = poolArray.length
        }
        return {
            err: 'provider',
            message: poolCount ? `Maximum number of providers reached: ${rentalProviders.length}.  `: 
                        `Maximum number of providers reached, showing ${poolCount} pools.\n Input fields below to add one.`,
            pool: poolCount ? true : false,
            credentials: true,
            success: poolCount ? true : false,
            pools: poolCount,
            provider: rental_provider_type,
            spartanbot: spartan
        }
    }
        
    
    //fn to check existence of a provider in MRRProvider.js
    const checkProviders = provType => {
        for (let prov of rentalProviders) {
            if (prov.getInternalType() === provType) {
                return true;
            }
        }
    };

    if (rental_provider_type === MiningRigRentals) {
        let poolArray = await spartan.returnPools(MiningRigRentals);
        if (checkProviders(MiningRigRentals)) {
            // No pool input data sent from user and no pools exist for user
            if (options.poolData === undefined ) {
                return {
                    err: 'pool',
                    message: poolArray.length ? 'Mining Rig Rentals account already exists \n' +
                                                'Current Limit: 1. Choose another rental provider \n' +
                                                'to add another account.   ' :
                                                'Mining Rig Rentals account already exists  \n' +
                                                'No pool found enter pool info below to add a pool.',
                    pool: poolArray.length ? true : false,
                    credentials: true,
                    success: poolArray.length ? true : false,
                    pools: poolArray.length,
                    provider: rental_provider_type,
    
                }
            } 
            else {
                try {
                    const currentProvider = getCurrentProvider.call(rentalProviders, options)
                    const pool = await addPool.call(spartan, currentProvider ,options)
                    return pool;
                } catch (e) {
                    return {
                        err: 'pool',
                        message: 'Parse error during addPool function \n',
                        pool:  false,
                        credentials: true,
                        success: false,
                        provider: rental_provider_type,
                        spartanbot: spartan
                    }
                }
            }
        }
    } else if (rental_provider_type === NiceHash) {
       
        // console.log('poolArray: add.js 210', poolArray)
        if (checkProviders(NiceHash)){
            let poolArray = await spartan.returnPools(NiceHash);
            console.log('poolArray: ADD.JS 214', poolArray)
            // No pool input data sent from user and no pools exist for user
            if (options.poolData === undefined ) {
                console.log( `NiceHash account already exists. 'Current Limit: 1. add.js line 223'`);
                return {
                    err: 'pool',
                    message: poolArray.length ? 'Nice Hash account already exists. Current Limit: 1. \n'+ 
                             `With ${poolArray.length} pool(s)   `: 
                             'Nice Hash account already exists. Current Limit: 1. \n'+
                             'No pool found enter pool info below to add a pool',
                    pool:  poolArray.length ? true : false,
                    credentials: true,
                    success: poolArray.length ? true : false,
                    pools: poolArray.length,
                    provider: NiceHash
                }
            } else {
                try {
                    const currentProvider = getCurrentProvider.call(rentalProviders, options)
                    const pool = await addPool.call(spartan, currentProvider ,options)
                    console.log('pool: 232', pool)
                    return pool
                } catch(e) {
                    return {
                        err: 'pool',
                        message: 'Parse error during addPool function \n',
                        pool:  false,
                        credentials: true,
                        success: false,
                        pools: poolArray.length,
                        provider: 'NiceHash',
                        spartanbot: spartan
                    }
                }
            }
        }
    }

    try {
        // Setup either NiceHash or Mining Rig Rentals and finds out if pools or profiles are added to the account also signs you in
        let setup_success = await spartan.setupRentalProvider({
            type: rental_provider_type,
            api_key: options.api_key,
            api_secret: options.api_secret,
            api_id: options.api_id,
            name: options.profileName || rental_provider_type
        });
        // return setup_success.provider.deletePoolProfile('99882').then(res => console.log('deletedPoolProfile: ',res))
        console.log('setup_success: top \n', setup_success.provider);


        if (setup_success.success) {
            if (setup_success.type === MiningRigRentals) {
                let poolArray = await spartan.returnPools(setup_success.type);
                /**
                 * @param {Object} - Add profile and pool 
                 * */
                
                if ( setup_success.poolProfiles.length === 0 ) {
                    //if user has no poolProfiles, prompt to create one
                    if (options.poolData === undefined) {
                        return {
                            err: 'pool',
                            message: `No pools found, input pool info below to continue:`,
                            pool: false,
                            credentials: true,
                            success: false,
                            provider: MiningRigRentals,
                            spartanbot: spartan
                        }
                    }
                } else {
                    /**
                     * @param {Array} - If User wants to add another Pool, they need just their id below
                     ********   let poolToAdd = 'the id of the pool you\'re trying to add' ************
                    **/
                    if (options.poolData === undefined) {
                        let poolProfiles = setup_success.poolProfiles;
                        let profileArray = [];
                        let profileIDs = [];
                        for (let profile of poolProfiles) {
                            console.log('profile:', profile.id)
                            profileArray.push(`Name: ${profile.name} - ID: ${profile.id}`);
                            profileIDs.push(profile.id);
                        }
                      
                        for (let id of profileIDs) {

                            // if (poolToAdd.includes(id)) {
                                setup_success.provider.setActivePoolProfile(id);
                                // const len = poolProfiles.length
                                // for (let i = 0; i < len; i++) {
                                // 	if (poolProfiles[i].id === id) {
                                // 		setup_success.provider.addPoolProfiles(poolProfiles[i])
                                // 	}
                                // }
                            // }
                        }

                        return {
                            provider: MiningRigRentals,
                            err: 'pool',
                            message: `Profile successfully added, profile id(s): ${profileIDs} \n`+
                                     `You have ${setup_success.pools.length} pool(s), fill out pool info below \n`+
                                     `to add another or click continue  `,
                            pool: setup_success.pools.length ? true : false,
                            credentials: true,
                            success: true,
                            spartan
                        }
                    } else {
                        /**
                         * RAN ONLY IF USER HAS A PROVIDER ADDED BUT DOESN'T HAVE A POOL.
                         */
                        try {
                            const currentProvider = getCurrentProvider.call(rentalProviders, options)
                            const pool = await addPool.call(spartan, currentProvider ,options)
                            console.log('pool: 200', pool)
                            return pool;
                        } catch (e) {
                            return {
                                err: 'pool',
                                message: 'Parse error during addPool function \n',
                                pool:  false,
                                credentials: true,
                                success: false,
                                provider: MiningRigRentals,
                                spartanbot: spartan
                            }
                        }
                    }
                }
            }
            if (setup_success.type === NiceHash) {
                let poolArray = await spartan.returnPools(setup_success.type);

                //if on pools, ask if they want to create one
                if (poolArray.length === 0) {
                    console.log('Found no pools to add, would you like to create one? 346')
                    if (options.poolData === undefined){
                        return {
                            err: 'pool',
                            message: `No pools found, input pool info below to continue.`,
                            pool: false,
                            credentials: true,
                            success: false,
                            provider: NiceHash,
                            spartanbot: spartan
                        }
                    } else {
                        const currentProvider = getCurrentProvider.call(rentalProviders, options)
                        const pool = await addPool.call(spartan, currentProvider ,options)
                    }
                        
        
                    if (confirm.option) {
                        //create pool
                        let NiceHashPool = options.poolData
                        await spartan.createPool(NiceHashPool);
                        setup_success.provider.setActivePool(NiceHashPool.id);
                        console.log(`Pool Added`);
                    }
                } else {
                    let PoolArray = [];
                    
                    for (let pool of poolArray) {
                        PoolArray.push(pool.id)
                        setup_success.provider.setActivePool(pool.id);
                        setup_success.provider.addPools(pool);
                    }
     
                    return {
                        provider: NiceHash,
                        err: 'pool',
                        message: `You have ${ PoolArray.length} pool(s). \n`+
                                 `Pool id: ${PoolArray}  `,
                        pool: true,
                        credentials: true,
                        success: true,
                        spartanbot: setup_success.spartan
                    }
                }
            }
            // spartan.serialize();
        } else {
            if (setup_success.message === 'settings.api_key is required!') {
                console.log('You must input an API Key!')
                return {
                    err: 'credentials',
                    message: 'settings.api_key is required!',
                    credentials: false,
                    success: false,
                    provider: rental_provider_type,
                    spartanbot: spartan
                }
            } else if (setup_success.message === 'settings.api_secret is required!') {
                console.log('You must input an API Secret!')
                return {
                    err: 'credentials',
                    message: 'You must input an API Secret!',
                    credentials: false,
                    success: false,
                    provider: rental_provider_type,
                    spartanbot: spartan
                }
            } else if ( setup_success.message === 'Provider Authorization Failed') {
                console.log('Unable to login to Account using API Key & API Secret, please check your keys and try again');
                return {
                    err: 'credentials',
                    message: 'Unable to login to Account using API Key or API Secret,\n'+
                             'please check your credentials and try again',
                    credentials: false,
                    success: false,
                    provider: rental_provider_type,
                    spartanbot: spartan
                }
            } else {
                return {
                    err: 'credentials',
                    message: setup_success.message,
                    credentials: false,
                    success: false,
                    provider: rental_provider_type,
                    spartanbot: spartan
                }
            }
        }
    } catch (e) {
      
            console.log('Error! Unable to add Rental Provider!\n add.js line 458' + e)
        return {
            err: 'provider',
            message: 'Error! Unable to add Rental Provider!\n' + e,
            credentials: false,
            pool: false,
            success: false,
            provider: rental_provider_type,
            spartanbot: spartan
        }
    }
};
