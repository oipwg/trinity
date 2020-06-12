const { formatToDate, formatTime } = require('../../src/helpers-functions/dateFormatter')

module.exports = function timestamp() {
    let time = Date.now();
    
    return `${formatToDate(time)}: ${formatTime(time)}` 
}