const NORMAL = 'NORMAL';
const WARNING = 'WARNING';
const CUTOFF = 'CUTOFF';
const LOW_BALANCE = 'LOW_BALANCE';

exports.manualRent = async (options) => {

    //self passed from rent.js which is the cli whole object
    let spartan = options.SpartanBot;
    let hashrate = options.hashrate
    let duration = options.duration;

    spartan.manualRent(hashrate, duration, async (preprocess, options) => {
        console.log(' spartan.manualRent manualRent.js 35 CALLBACK', preprocess)
        //cancel any ongoing processes so that we can display preprocess prompts

        const badges = preprocess.badges;
        if (badges.length === 0) {
            return {
                confirm: false,
                message: 'No rental options found with current balance and desired options.',
            };
        }

        const statusBadges = {
            normal: '*NORMAL',
            cutoff: '*CUTOFF',
            extension: '*EXTENSION',
            low_balance: '*LOW_BALANCE',
        };

        const statusMessages = {
            normal: console.log(
                `*NORMAL - Normal status. Provider found approx. what user requested.`
            ),
            extension: console.log(
                `*EXTENSION - Warning status. Minimum rental requirements apply. Duration will be extended.`
            ),
            cutoff: console.log(
                `*CUTOFF - Warning status. Attempt to bypass minimum rental requirements by cancelling at requested time. Application must remain running to cancel.`
            ),
            low_balance: console.log(
                `*LOW_BALANCE - Warning status. Provider has low balance, cannot rent for desired duration/limit.`
            ),
        };

        let statuses = {
            normal: false,
            extension: false,
            cutoff: false,
            low_balance: false,
        };

        //make a 2layer deep copy of the badges so that we can display different info for the cutoffs
        let badgesCopy = badges.map(obj => ({ ...obj }));
 

        //apply status text to badges
        let badgesObject = {};
        for (let badge of badgesCopy) {
            let statusText;
            if (badge.status.status === NORMAL) {
                statuses.normal = true;
                statusText = statusBadges.normal;
            }
            if (badge.status.status === WARNING) {
                if (badge.status.type === CUTOFF) {
                    if (badge.cutoff) {
                        badge.amount = badge.status.cutoffCost;
                        badge.duration = badge.status.desiredDuration;
                        statuses.cutoff = true;
                        statusText = statusBadges.cutoff;
                    } else {
                        statuses.extension = true;
                        statusText = statusBadges.extension;
                    }
                }
                if (badge.status.type === LOW_BALANCE) {
                    statuses.low_balance = true;
                    statusText = statusBadges.low_balance;
                }
            }
            badge.statusText = statusText;
            badgesObject[badge.id] = badge;
        }

        const fmtPool = (badge) => {
                    return `${'Market'}: ` +
                    `${badge.market} ${'Price'}: ` +
                    `${badge.price} BTC/TH/DAY ` +
                    `${'Amount:'} ` +
                    `${badge.amount.toFixed(6)} BTC ` +
                    // `${badge.last10AvgCostMrrScrypt.toFixed(6)} BTC ` +
                    `${'Hash Limit:'} ` +
                    `${badge.limit * 1000 * 1000} MH ` +
                    `${`Duration:`} ` +
                    `${badge.duration} hours ` +
                    `${badge.statusText}`;
        };

        let fmtBadges = [];
        let fmtObject = {};

        for (let badge of badgesCopy) {
            fmtBadges.push(fmtPool(badge));
            fmtObject[badge.id] = fmtPool(badge);
        }

        for (let status in statuses) {
            if (statuses[status]) console.log('manualRent.js 109 \n' ,statusMessages[status]);
        }

        // let rentPrompt = await self.prompt({
        //     type: 'list',
        //     message: 'Select from the following: ',
        //     name: 'options',
        //     choices: [...fmtBadges, exit],
        // });
  
        let rentPrompt = [...fmtBadges];
        // console.log('rentPrompt: manualRent.js 141', rentPrompt)

        // let selection = rentPrompt.options;
        let selection = fmtBadges

        let badgeID;
        let _badge;

        // devide by 8 0's cost_found: 27832275.368004683 / 100,000,000

         
            let confirmation = true
            if (!confirmation) {
                return { confirm: false, message: 'Rent cancelled' };
            } else {
                for (let id in fmtObject) {
                    // console.log('FMTOBJECT', fmtObject[id])
                    // console.log('SELECTION ', selection)
                    if (fmtObject[id] === selection) badgeID = id;
                }
                for (let badge of badges) {
                    // console.log('badge: manualRent.js 165', badge)
                    if (badge.id === badgeID) _badge = badge;
                }
            }
        console.log('Renting...');
        
        return {
            confirm: true,
            badges: _badge,
        };
    });
};




// Each rig hashrate:  250.635 / 1000 / 1000
// Each rig hashrate:  250.66299999999998 / 1000 / 1000
// Each rig hashrate:  5277.826999999999 / 1000 / 1000
// Each rig hashrate:  5279.191999999999 / 1000 / 1000
// Each rig hashrate:  5279.231999999999 / 1000 / 1000
// Each rig hashrate:  5683.734999999999 / 1000 / 1000
// Each rig hashrate:  6077.536999999998 / 1000 / 1000
// Each rig hashrate:  6627.608999999999 / 1000 / 1000
// Each rig hashrate:  7254.196999999998 / 1000 / 1000
// Each rig hashrate:  7856.675999999999 / 1000 / 1000
// Each rig hashrate:  8525.347999999998 / 1000 / 1000
// Each rig hashrate:  9089.276999999998 / 1000 / 1000
// Each rig hashrate:  9498.968999999997 / 1000 / 1000
// Each rig hashrate:  9987.437999999996  / 1000 / 1000

// badges:
//     { market: 'MiningRigRentals',
//       status: { status: 'NORMAL' },
//       amount: 0.00049257,
//       totalHashesTH: 107.86433039999997,
//       hashesDesiredTH: 108,
//       duration: '3',
//       limit: 0.009987437999999996,
//       price: 0.394552,
//       balance: 0.00429233,
//       query:
//        { hashrate_found: 9987.437999999996,
//          cost_found: 0.00049257,
//          duration: '3' },
//       uid: 'uuydvt5',
//       rigs:
//        [ [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object],
//          [Object]

