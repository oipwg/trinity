const spartan = require('spartanbot')
let spartan = new SpartanBot()

const NORMAL = 'NORMAL'
const WARNING = 'WARNING'
const CUTOFF = 'CUTOFF'
const LOW_BALANCE = 'LOW_BALANCE'

export const manualRent = async (self, spartan) => {
    //self passed from rent.js which is the cli whole object
    // const exit = vorpal.chalk.red('exit')
    const questions = [
        {
            type: 'input',
            name: 'hashrate',
            default: '5000',
            message: vorpal.chalk.yellow(
                'How much Hashrate would you like to rent (MH)? '
            ),
        },
        {
            type: 'input',
            name: 'duration',
            default: '3',
            message: vorpal.chalk.yellow(
                'How long would you like to rent your miner? (hours) '
            ),
        },
    ]

    let answers = await self.prompt(questions)
    let hashrate = 1762487
    let duration = 1467067237
    // let hashrate = answers.hashrate
    // let duration = answers.duration

    // self.log(vorpal.chalk.cyan('Searching for miners...'))
    // console.log(vorpal.ui._activePrompt)

    spartan.manualRent(hashrate, duration, async (preprocess, options) => {
        //cancel any ongoing processes so that we can display preprocess prompts
        // console.log('midPrompt: ', vorpal.ui._midPrompt)
        vorpal.ui.cancel()

        // self.log('preprocess: ', preprocess)
        const badges = preprocess.badges
        if (badges.length === 0) {
            return {
                confirm: false,
                message:
                    'No rental options found with current balance and desired options.',
            }
        }

        const statusBadges = {
            normal: vorpal.chalk.bgGreen.white('*NORMAL'),
            cutoff: vorpal.chalk.bgYellow.white('*CUTOFF'),
            extension: vorpal.chalk.bgBlue.white('*EXTENSION'),
            low_balance: vorpal.chalk.bgRed.white('*LOW_BALANCE'),
        }

        const statusMessages = {
            normal: vorpal.chalk.bgGreen(
                `*NORMAL - Normal status. Provider found approx. what user requested.`
            ),
            extension: vorpal.chalk.bgBlue(
                `*EXTENSION - Warning status. Minimum rental requirements apply. Duration will be extended.`
            ),
            cutoff: vorpal.chalk.bgYellow(
                `*CUTOFF - Warning status. Attempt to bypass minimum rental requirements by cancelling at requested time. Application must remain running to cancel.`
            ),
            low_balance: vorpal.chalk.bgRed(
                `*LOW_BALANCE - Warning status. Provider has low balance, cannot rent for desired duration/limit.`
            ),
        }

        let statuses = {
            normal: false,
            extension: false,
            cutoff: false,
            low_balance: false,
        }

        //make a 2layer deep copy of the badges so that we can display different info for the cutoffs
        let badgesCopy = badges.map(obj => ({ ...obj }))

        //apply status text to badges
        let badgesObject = {}
        for (let badge of badgesCopy) {
            let statusText
            if (badge.status.status === NORMAL) {
                statuses.normal = true
                statusText = statusBadges.normal
            }
            if (badge.status.status === WARNING) {
                if (badge.status.type === CUTOFF) {
                    if (badge.cutoff) {
                        badge.amount = badge.status.cutoffCost
                        badge.duration = badge.status.desiredDuration
                        statuses.cutoff = true
                        statusText = statusBadges.cutoff
                    } else {
                        statuses.extension = true
                        statusText = statusBadges.extension
                    }
                }
                if (badge.status.type === LOW_BALANCE) {
                    statuses.low_balance = true
                    statusText = statusBadges.low_balance
                }
            }
            badge.statusText = statusText
            badgesObject[badge.id] = badge
        }

        const fmtPool = (badge, vorpal) => {
            return `${vorpal.chalk.white.bold(
                `${vorpal.chalk.red('Market')}: ` +
                    `${badge.market} ${vorpal.chalk.blue('Price')}: ` +
                    `${badge.price} BTC/TH/DAY ` +
                    `${vorpal.chalk.green(`Amount:`)} ` +
                    `${badge.amount.toFixed(6)} BTC ` +
                    `${vorpal.chalk.yellow('Hash Limit:')} ` +
                    `${badge.limit * 1000 * 1000} MH ` +
                    `${vorpal.chalk.yellow(`Duration`)} ` +
                    `${badge.duration} hours ` +
                    `${badge.statusText}`
            )}`
        }
        let fmtBadges = []

        let fmtObject = {}
        for (let badge of badgesCopy) {
            fmtBadges.push(fmtPool(badge, vorpal))
            fmtObject[badge.id] = fmtPool(badge, vorpal)
        }

        for (let status in statuses) {
            if (statuses[status]) self.log(statusMessages[status])
        }

        let rentPrompt = await self.prompt({
            type: 'list',
            message: vorpal.chalk.yellow('Select from the following: '),
            name: 'options',
            choices: [...fmtBadges, exit],
        })
        let selection = rentPrompt.options

        let badgeID
        let _badge

        if (selection === exit) {
            return { confirm: false, message: 'Rent cancelled' }
        } else {
            let confirmationPrompt = await self.prompt({
                type: 'confirm',
                message: vorpal.chalk.green('Are you sure?'),
                default: false,
                name: 'confirm',
            })
            let confirmation = confirmationPrompt.confirm
            if (!confirmation) {
                return { confirm: false, message: 'Rent cancelled' }
            } else {
                for (let id in fmtObject) {
                    if (fmtObject[id] === selection) badgeID = id
                }
                for (let badge of badges) {
                    if (badge.id === badgeID) _badge = badge
                }
            }
        }
        self.log(vorpal.chalk.yellow('Renting...'))
        // self.log(vorpal.ui._activePrompt, vorpal.ui._midPrompt)
        return {
            confirm: true,
            badges: _badge,
        }
    })
}
