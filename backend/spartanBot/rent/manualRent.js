const NORMAL = 'NORMAL';
const WARNING = 'WARNING';
const CUTOFF = 'CUTOFF';
const LOW_BALANCE = 'LOW_BALANCE';

exports.manualRent = (options) => {
// exports.manualRent = async (options) => {

    //self passed from rent.js which is the cli whole object
    let spartan = options.SpartanBot;
    let sparta =  spartan.manualRent(options, (preprocess, options) => {
    // let sparta =  await spartan.manualRent(options, async (preprocess, options) => {
        console.log(' spartan.manualRent manualRent.js 35 CALLBACK', preprocess, options)
 
        const badges = preprocess.badges;
        
    });
};



