const add = require('./add/add')
const list = require('./list')
const delete_ = require('./delete')

// An array of all the supported commands
const COMMANDS = [add, list, delete_]

module.exports = function(vorpal, options) {
    // For each Command in the COMMANDS array
    for (let command of COMMANDS) {
        // command(vorpal, options)
    }
}
