const NORMAL = 'NORMAL';
const WARNING = 'WARNING';
const CUTOFF = 'CUTOFF';
const LOW_BALANCE = 'LOW_BALANCE';

exports.manualRent = async (options) => {

    //self passed from rent.js which is the cli whole object
    let spartan = options.SpartanBot;

    let sparta =  await spartan.manualRent(options, async (preprocess, options) => {
        console.log(' spartan.manualRent manualRent.js 35 CALLBACK', preprocess, options)
        //cancel any ongoing processes so that we can display preprocess prompts
 
        const badges = preprocess.badges;
        if (badges.length === 0) {
            return {
                confirm: false,
                message: 'No rental options found with current balance and desired options.',
            };
        }
    });
};



