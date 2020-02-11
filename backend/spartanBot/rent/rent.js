import { manualRent } from './manualRent'

//This file doesn't exist
// import rentSelector from './manualRentSelector'

const NORMAL = 'NORMAL'
const WARNING = 'WARNING'
const ERROR = 'ERROR'

export default function(vorpal, options) {
    let spartan = options.SpartanBot

    vorpal
        .command('rent')
        .description('Manually rent a miner')
        .action(async function(args, cb) {
            const self = this
            const exit = vorpal.chalk.red(`exit`)

            let rental_providers = spartan.getRentalProviders()

            if (rental_providers.length === 0) {
                return this.log(
                    vorpal.chalk.yellow(
                        "No Rental Providers were found! Please run '"
                    ) +
                        vorpal.chalk.cyan('rentalprovider add') +
                        vorpal.chalk.yellow("' to add your API keys.")
                )
            }

            let promptRentType = await self.prompt({
                type: 'list',
                name: 'option',
                message: vorpal.chalk.yellow('Select rent mode:'),
                choices: [
                    'Manual',
                    'Spot',
                    'Tradebot',
                    'Collective Defense',
                    exit,
                ],
            })
            let rentType = promptRentType.option

            if (rentType === exit) return

            async function interactiveObjectInspection(object) {
                let keys = Object.keys(object)
                let modifiedKeys = []
                for (let key of keys) {
                    modifiedKeys.push(
                        (key += `: ${vorpal.chalk.yellow(object[key])}`)
                    )
                }
                let promptChoices = [...modifiedKeys, exit]
                let inspectionPrompt = await self.prompt({
                    type: 'list',
                    message: 'View your receipt',
                    name: 'option',
                    choices: promptChoices,
                })
                if (inspectionPrompt.option === exit) return true

                let param = inspectionPrompt.option
                let splited = param.split(':')
                param = splited[0]
                if (
                    Array.isArray(object[param]) ||
                    typeof object[param] === 'object'
                ) {
                    self.log(object[param])
                } else {
                    self.log(vorpal.chalk.yellow(object[param]))
                }
                await interactiveObjectInspection(object)
            }

            spartan.onRentalSuccess(() => {})
            spartan.onRentalWarning(() => {})
            spartan.onRentalError(() => {})

            async function onRentalFnFinish(rental_info) {
                switch (rental_info.status) {
                    case NORMAL:
                        self.log(vorpal.chalk.green(`Rental was a success!`))
                        break
                    case WARNING:
                        self.log(vorpal.chalk.yellow(`Status: Warning`))
                        break
                    case ERROR:
                        self.log(
                            vorpal.chalk.red(
                                `There was an error attempting to rent.`
                            )
                        )
                        self.log(rental_info)
                        break
                    default:
                        self.log('Rental info not of expected type!')
                }
                await interactiveObjectInspection(rental_info)
            }
            spartan.emitter.on('RentalFunctionFinish', onRentalFnFinish)

            if (rentType === 'Manual') {
                await manualRent(self, vorpal, spartan)
            }

            if (rentType === 'Spot') {
            }

            if (rentType === 'Tradebot') {
            }

            if (rentType === 'Collective Defense') {
            }
        })
}
