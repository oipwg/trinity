const fs = require('fs');
const storage = process.cwd() +'/localStorage/spartanbot-storage';

module.exports = function(options) {
    options.SpartanBot.clearStorage()
}
