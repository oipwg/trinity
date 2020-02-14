const rent = require('./rent')
const COMMANDS = [rent]

module.exports = function(options) {
    console.log('options ', options)
    for (let command of COMMANDS) {
        console.log('coming from rent index.js ')
        // command(vorpal, options)
    }
}
