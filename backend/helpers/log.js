
const { timestamp } = require('./timestamp')

exports.log = function () {
    return console.log(timestamp(),'---', ...arguments)
}