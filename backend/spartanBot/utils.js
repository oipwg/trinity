const timestring = require('timestring');



exports.convertHumanTimeToSeconds = function(time) {
    if (time.indexOf('h') === -1 || time.indexOf('H') === 1) time = `${time}h`;

    return timestring(time);
};


exports.convertHumanHashrateToMH = function(human_hashrate) {
    const UNIT_SYMBOLS = [
        {
            value: 0.001,
            symbols: ['k', 'kh', 'K', 'KH'],
        },
        {
            value: 1,
            symbols: ['m', 'mh', 'M', 'MH'],
        },
        {
            value: 1000,
            symbols: ['g', 'gh', 'G', 'GH'],
        },
        {
            value: 1000000,
            symbols: ['t', 'th', 'T', 'TH'],
        },
    ];

    let number_value = parseFloat(human_hashrate.match(/[0-9]+/)[0]);
    let symbol_value = human_hashrate.match(/[a-zA-Z]+/)[0];

    let match = false;
    for (let symbol of UNIT_SYMBOLS) {
        if (symbol.symbols.indexOf(symbol_value) !== -1) {
            match = true;
            return number_value * symbol.value;
        }
    }
    if (!match) {
        convertHumanHashrateToMH(`${human_hashrate}mh`);
    }
};
exports.getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

exports.serPool = pool => {
    let tmpObj = {};
    for (let opt in pool) {
        if (opt === 'algo') {
            tmpObj.type = pool[opt];
        } else if (opt === 'pool_host') {
            tmpObj.host = pool[opt];
        } else if (opt === 'pool_port') {
            tmpObj.port = pool[opt];
        } else if (opt === 'pool_user') {
            tmpObj.user = pool[opt];
        } else if (opt === 'pool_pass') {
            tmpObj.pass = pool[opt];
        } else {
            tmpObj[opt] = pool[opt];
        }
    }
    return tmpObj;
};
