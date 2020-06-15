const { formatToDate, formatTime } = require('../../src/helpers-functions/dateFormatter')

exports.timestamp = () => {
    let time = Date.now();
    
    return `${formatToDate(time)}: ${formatTime(time)}` 
}