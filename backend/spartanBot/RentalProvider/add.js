import { config } from 'dotenv'
config()

import {
	Prompt_MRRAPIKeys,
	Prompt_NiceHashAPIKeys,
	Prompt_CreatePoolProfile,
	Prompt_RentalProviders,
	Prompt_OptionalName,
	Prompt_AddOrCreatePool,
	Prompt_AddPool,
	Prompt_NiceHashCreatePool
} from "./promptFunctions";
import {fmtPool, serPool} from "../../../utils";

const MiningRigRentals = 'MiningRigRentals'
const NiceHash = 'NiceHash'

export default function(vorpal, options){
	let spartan = options.SpartanBot;

	vorpal
	.command('rentalprovider add')
	.description('Add a rental provider to Spartan Bot')
	.alias('rp add')
	.action(async function(args) {
		const self = this;
		const exit = vorpal.chalk.red(`exit`)

		let rentalProviders = spartan.getRentalProviders()
		if (rentalProviders.length === 2)
			return self.log(vorpal.chalk.red('Maximum number of providers reached.'))

		let select_rental_providers = await Prompt_RentalProviders(self, vorpal, spartan);

		let rental_provider_type = select_rental_providers.rental_provider;
		if (rental_provider_type === exit)
			return;

		//fn to check existence of a provider
		const checkProviders = (provType) => {
			for (let prov of rentalProviders) {
				if (prov.getInternalType() === provType) {
					return true
				}
			}
		}
		let api_answers;
		if (rental_provider_type === MiningRigRentals) {
			if (checkProviders(MiningRigRentals))
				return self.log(vorpal.chalk.red(`MiningRigRentals account already exists. ${vorpal.chalk.cyan('Current Limit: 1.')} `))

			api_answers = await Prompt_MRRAPIKeys(self, vorpal);
			process.env.MRR_API_KEY = api_answers.api_key
			process.env.MRR_API_SECRET = api_answers.api_secret
		} else if (rental_provider_type === NiceHash) {
			if (checkProviders(NiceHash))
				return self.log(vorpal.chalk.red(`NiceHash account already exists. ${vorpal.chalk.cyan('Current Limit: 1.')} `))

			api_answers = await Prompt_NiceHashAPIKeys(self, vorpal);
			process.env.NICEHASH_API_KEY = api_answers.api_key
			process.env.NICEHASH_API_ID = api_answers.api_id
		}

		let provider_name = await Prompt_OptionalName(self, vorpal);

		try {
			let setup_success = await spartan.setupRentalProvider({
				type: rental_provider_type,
				api_key: api_answers.api_key,
				api_secret: api_answers.api_secret,
				api_id: api_answers.api_id,
				name: provider_name.name === 'undefined' ? undefined : provider_name.name
			});

			// this.log(vorpal.chalk.green('Setup success: \n',JSON.stringify(setup_success.pools, null, 4)));

			if (setup_success.success){
				spartan.returnPools();
				this.log(vorpal.chalk.white("Successfully added a new Rental Provider."));
				if (setup_success.type === 'MiningRigRentals') {
					//if user has no pools, prompt to create one
					if (setup_success.poolProfiles.length === 0) {
						let poolData;
						let poolInfo = await Prompt_CreatePoolProfile(self, vorpal, spartan);
						try {
							poolData = await setup_success.provider.createPoolProfile(poolInfo);
						} catch (err) {
							self.log(`Error while creating the profile: ${err}`)
						}

						if (poolData && poolData.success && poolData.success.success) {
							setup_success.provider.setActivePoolProfile(poolData.profileID)
							for (let p of spartan.getRentalProviders()) {
								if (p.getUID() !== setup_success.provider.getUID()) {
									p.addPools(poolData.pool)
								}
							}
							spartan.serialize();
							self.log(vorpal.chalk.green(`Pool successfully added`))
						} else {
							if (poolData === null || poolData === undefined) {
								self.log(vorpal.chalk.red(`Pool unsuccessfully added. Pool Data: ${poolData}`))
							}
						}
					} else {
						let addOrCreatePool = await Prompt_AddOrCreatePool(self, vorpal, setup_success.provider);

						if (addOrCreatePool.option === 'select') {
							let poolProfiles = setup_success.poolProfiles;

							let profileArray = [];
							let profileIDs = [];
							for (let profile of poolProfiles) {
								profileArray.push(`Name: ${profile.name} - ID: ${profile.id}`)
								profileIDs.push(profile.id)
							}
							let poolToAdd = await Prompt_AddPool(self, vorpal, profileArray)
							for (let id of profileIDs) {
								if (poolToAdd.option.includes(id)) {
									setup_success.provider.setActivePoolProfile(id)
									// const len = poolProfiles.length
									// for (let i = 0; i < len; i++) {
									// 	if (poolProfiles[i].id === id) {
									// 		setup_success.provider.addPoolProfiles(poolProfiles[i])
									// 	}
									// }
								}
							}
							spartan.serialize()
						}

						if (addOrCreatePool.option === 'create') {
							let poolData;
							let poolInfo = await Prompt_CreatePoolProfile(self, vorpal, spartan);
							try {
								poolData = await setup_success.provider.createPoolProfile(poolInfo);
							} catch (err) {
								self.log(`Error while creating the profile: ${err}`)
							}

							if (poolData && poolData.success && poolData.success.success) {
								setup_success.provider.setActivePoolProfile(poolData.profileID)
								for (let p of spartan.getRentalProviders()) {
									if (p.getUID() !== setup_success.provider.getUID()) {
										p.addPools(poolData.pool)
									}
								}
								spartan.serialize();
								self.log(vorpal.chalk.green(`Pool successfully added`))
							} else {
								if (poolData === null || poolData === undefined) {
									self.log(vorpal.chalk.red(`Pool unsuccessfully added. Pool Data: ${poolData}`))
								}
							}
						}
 					}
				}
				if (setup_success.type === 'NiceHash') {
					let poolOptions = await Prompt_AddOrCreatePool(self, vorpal, setup_success.provider);
					if (poolOptions.option === 'add') {

						let poolArray = await spartan.returnPools();

						//if on pools, ask if they want to create one
						if (poolArray.length === 0) {
							let confirm = await self.prompt({
								type: 'confirm',
								name: 'option',
								default: true,
								message: vorpal.chalk.yellow('Found no pools to add, would you like to create one?')
							});
							if (confirm.option) {
								//create pool
								let NiceHashPool = await Prompt_NiceHashCreatePool(self, vorpal, spartan);
								await spartan.createPool(NiceHashPool);
								setup_success.provider.setActivePool(NiceHashPool.id);
								self.log(`Pool Added`)
							}
						} else {
							let fmtPoolArray = [];
							for (let pool of poolArray) {
								fmtPoolArray.push(fmtPool(serPool(pool), vorpal))
							}
							let poolPicked = await Prompt_AddPool(self, vorpal, fmtPoolArray);

							let poolObject = {};
							for (let pool of poolArray) {
								poolObject[fmtPool(serPool(pool), vorpal)] = pool.id
							}

							let poolid = poolObject[poolPicked.option]
							setup_success.provider.setActivePool(poolid)
							for (let pool of poolArray) {
								if (pool.id === poolid) {
									setup_success.provider.addPools(pool)
								}
							}
						}
					} else if (poolOptions.option === 'create') {
						//Prompt create Nice Hash pool
						let NiceHashPool = await Prompt_NiceHashCreatePool(self, vorpal, spartan);
						await spartan.createPool(NiceHashPool);
						self.log(`Pool Created`)
					}
				}
				spartan.serialize()
			}  else  {
				if(setup_success.message === "settings.api_key is required!"){
					this.log(vorpal.chalk.red("You must input an API Key!"))
				} else if (setup_success.message === "settings.api_secret is required!"){
					this.log(vorpal.chalk.red("You must input an API Secret!"))
				} else if (setup_success.message === "Provider Authorization Failed"){
					this.log(vorpal.chalk.red("Unable to login to Account using API Key & API Secret, please check your keys and try again"))
				}
			}
		} catch (e) {
			this.log(vorpal.chalk.red("Error! Unable to add Rental Provider!\n" + e))
		}
	});
}
