"use strict";
const util = require('util');
const SignalRClient = require('../lib/client.js');
let client = new SignalRClient({
    // websocket will be automatically reconnected if server does not respond to ping after 10s
    pingTimeout:10000,
    watchdog:{
        // automatically reconnect if we don't receive markets data for 30min (this is the default)
        markets:{
            timeout:1800000,
            reconnect:true
        }
    },
    // use cloud scraper to bypass Cloud Fare (default)
    useCloudScraper:true
});

//-- event handlers
client.on('orderBook', function(data){
    console.log(util.format("Got full order book for pair '%s' : cseq = %d", data.pair, data.cseq));
});
client.on('orderBookUpdate', function(data){
    console.log(util.format("Got order book update for pair '%s' : cseq = %d", data.pair, data.cseq));
});
client.on('trades', function(data){
    console.log(util.format("Got trades for pair '%s'", data.pair));
});

//-- start subscription
console.log("=== Subscribing to 'USDT-BTC' pair");
client.subscribeToMarkets(['USDT-BTC']);


// disconnect client after 60s
setTimeout(function(){
    console.log('=== Disconnecting...');
    client.disconnect();
    process.exit(0);
}, 120000);