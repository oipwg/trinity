import uid from 'uid'

export const Prompt_RentalProviders = async (self, vorpal, spartan) => {
	const exit = vorpal.chalk.red(`exit`)
	return await self.prompt({
		type: 'list',
		name: 'rental_provider',
		message: vorpal.chalk.yellow('Which Rental Provider would you like to add?'),
		choices: [...spartan.getSupportedRentalProviders(), exit]
	});
};

export const Prompt_MRRAPIKeys = async (self, vorpal) => {
	return await self.prompt([
		{
			type: "input",
			name: "api_key",
			message: vorpal.chalk.yellow("Please enter your API Key: "),
			default: process.env.MRR_API_KEY
		},{
			type: "input",
			name: "api_secret",
			message: vorpal.chalk.yellow("Please enter your API Secret: "),
			default: process.env.MRR_API_SECRET
		}
	]);
};

export const Prompt_NiceHashAPIKeys = async (self, vorpal) => {
	return await self.prompt([
		{
			type: "input",
			name: "api_key",
			message: vorpal.chalk.yellow("Please enter your API Key: "),
			default: process.env.NICEHASH_API_KEY
		},{
			type: "input",
			name: "api_id",
			message: vorpal.chalk.yellow("Please enter your API ID: "),
			default: process.env.NICEHASH_API_ID
		}
	]);
};

export const Prompt_OptionalName = async (self, vorpal) => {
	return await self.prompt({
		type: "input",
		name: "name",
		message: vorpal.chalk.yellow("Add an optional name to your rental provider: "),
		default: 'undefined'
	});
};

export const Prompt_AddOrCreatePool = async (self, vorpal, provider) => {
	const exit = vorpal.chalk.red(`exit`)
	let message = provider.getInternalType() === "MiningRigRentals" ? (
		vorpal.chalk.yellow("Select a pool profile to use or create a new one")
	) : (vorpal.chalk.yellow("Add an existing pool or a create a new pool"))
	let choices = provider.getInternalType() === "MiningRigRentals" ? (['select', 'create', exit]) : (
		['add', 'create', exit]
	)
	return await self.prompt({
		type: 'list',
		name: 'option',
		message: message,
		choices: choices
	});
};

export const Prompt_AddPool = async (self, vorpal, poolArray) => {
	const exit = vorpal.chalk.red(`exit`)
	return await self.prompt({
		type: 'list',
		name: 'option',
		message: vorpal.chalk.yellow("Please choose from the following: "),
		choices: [...poolArray, exit]
	});
}

export const Prompt_CreateMRRPool = async (self, vorpal, spartan) => {
	let poolOptions = {};

	let name = await self.prompt({
		type: 'input',
		name: 'name',
		message: vorpal.chalk.yellow('Name: '),
		default: uid()
	});
	poolOptions.name = name.name;

	let type = await self.prompt({
		type: 'input',
		name: 'type',
		message: vorpal.chalk.yellow('Algo (scrypt, x11, sha256, etc...): '),
		default: 'scrypt'
	});
	poolOptions.type = type.type;

	let host = await self.prompt({
		type: 'input',
		name: 'host',
		message: vorpal.chalk.yellow('Input a host url: '),
		default: 'snowflake.oip.fun'
	});
	poolOptions.host = host.host;

	let port = await self.prompt({
		type: 'input',
		name: 'port',
		message: vorpal.chalk.yellow('Input a port to mine on: '),
		default: 3043
	});
	poolOptions.port = port.port;

	let user = await self.prompt({
		type: 'input',
		name: 'user',
		message: vorpal.chalk.yellow('Input a wallet address to receive funds at: '),
		description: 'Your workname',
		default: spartan.wallet.wallet.coins['flo'].getMainAddress().getPublicAddress()
	});
	poolOptions.user = user.user;

	let pass = await self.prompt({
		type: 'input',
		name: 'pass',
		message: vorpal.chalk.yellow(`${vorpal.chalk.red('Optional')} add a password: `),
		default: 'x'
	});
	poolOptions.pass = pass.pass;

	let notes = await self.prompt({
		type: 'input',
		name: 'notes',
		message: vorpal.chalk.yellow(`${vorpal.chalk.red('Optional')} add any additional notes: `),
		default: `Created at ${Date.now()}`
	});
	poolOptions.notes = notes.notes;

	return poolOptions

}

export const Prompt_CreatePoolProfile = async (self, vorpal, spartan) => {
	let poolOptions = {};
	let profileName = await self.prompt({
		type: 'input',
		name: 'profileName',
		message: vorpal.chalk.yellow('Input a pool profile name: '),
		default: uid()
	});
	poolOptions.profileName = profileName.profileName;

	let algo = await self.prompt({
		type: 'input',
		name: 'algo',
		message: vorpal.chalk.yellow('Input an algorithm to mine with (scrypt, x11, sha256, etc...): '),
		default: 'scrypt'
	});
	poolOptions.algo = algo.algo;

	let host = await self.prompt({
		type: 'input',
		name: 'host',
		message: vorpal.chalk.yellow('Input a host url: '),
		default: 'snowflake.oip.fun'
	});
	poolOptions.host = host.host;

	let port = await self.prompt({
		type: 'input',
		name: 'port',
		message: vorpal.chalk.yellow('Input a port to mine on: '),
		default: 3043
	});
	poolOptions.port = port.port;

	let user = await self.prompt({
		type: 'input',
		name: 'user',
		message: vorpal.chalk.yellow('Input a wallet address to receive funds at: '),
		description: 'Your workname',
		default: spartan.wallet.wallet.coins['flo'].getMainAddress().getPublicAddress()
	});
	poolOptions.user = user.user;

	let priority = await self.prompt({
		type: 'list',
		name: 'priority',
		message: vorpal.chalk.yellow('What priority would you like this pool to be at?: '),
		choices: ['0', '1', '2', '3', '4']
	});
	poolOptions.priority = priority.priority;

	let pass = await self.prompt({
		type: 'input',
		name: 'pass',
		message: vorpal.chalk.yellow(`${vorpal.chalk.red('Optional')} add a password: `),
		default: 'x'
	});
	poolOptions.pass = pass.pass;

	let notes = await self.prompt({
		type: 'input',
		name: 'notes',
		message: vorpal.chalk.yellow(`${vorpal.chalk.red('Optional')} add any additional notes: `),
		default: `Created at ${Date.now()}`
	});
	poolOptions.notes = notes.notes;

	return poolOptions
};

export const Prompt_NiceHashCreatePool = async (self, vorpal, spartan) => {
	let NiceHashPool = {}
	let type = await self.prompt({
		type: 'input',
		name: 'type',
		message: vorpal.chalk.yellow('Algo: '),
		default: 'scrypt'
	});
	NiceHashPool["algo"] = type.type;

	let host = await self.prompt({
		type: 'input',
		name: 'host',
		message: vorpal.chalk.yellow(`Host: `),
		default: "snowflake.oip.fun"
	});
	NiceHashPool["pool_host"] = host.host;

	let port = await self.prompt({
		type: 'input',
		name: 'port',
		message: vorpal.chalk.yellow('Port: '),
		default: 3043
	})
	NiceHashPool["pool_port"] = port.port

	let user = await self.prompt({
		type: 'input',
		name: 'user',
		message: vorpal.chalk.yellow('User: '),
		default: spartan.wallet.wallet.coins['flo'].getMainAddress().getPublicAddress()
	})
	NiceHashPool["pool_user"] = user.user

	let pass = await self.prompt({
		type: 'input',
		name: 'pass',
		message: vorpal.chalk.yellow('Password: '),
		default: 'x'
	})
	NiceHashPool["pool_pass"] = pass.pass

	let id = uid();
	let name = await self.prompt({
		type: 'input',
		name: 'name',
		message: vorpal.chalk.yellow('Name: '),
		default: `NiceHash Pool: ${id}`
	});
	NiceHashPool["name"] = name.name;
	NiceHashPool.id = id

	return NiceHashPool
};

