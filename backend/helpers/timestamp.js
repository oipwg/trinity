<<<<<<< HEAD
  const { formatToDate, formatTime } = require('../../src/helpers-functions/dateFormatter')
=======
const { formatToDate, formatTime } = require('../../src/helpers-functions/dateFormatter')
>>>>>>> adb8862ffb3e853002dec2dd6cd68dff7fc781cd

exports.timestamp = () => {
    let time = Date.now();
    
    return `[${formatToDate(time)} ${formatTime(time)}]` 
}