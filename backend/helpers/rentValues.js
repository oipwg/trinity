const https = require('https');
const request = require('request');

exports.Rent = async (  token, percent) => {
    if (token === "FLO") {
        return await new Promise((resolve, reject) => {
            https.get('https://livenet.flocha.in/api/status?q=getInfos', (response) => {
                let body = ''
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    let data = JSON.parse(body)
                    if(!data) console.log('HEY')
                    let difficulty = data.info.difficulty
                    let hashrate = difficulty * Math.pow(2, 32) / 40
                    let Networkhashrate = hashrate / 1000000000000;  // TH/s
                    let Rent = Networkhashrate * (-percent / (-1 + percent)) // * 1000000 for MRR to MH/s
                    let MinPercentFromMinHashrate = 1000000000000 * .01 / ((difficulty * Math.pow(2, 32) / 40) + (1000000000000 * .01))
                    resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate })
                });
                
            }).on("error", (error) => {
                console.log("Error: " + error.message);
                reject("Error: " + error.message)
            });
        })
    }

    if (token === "RVN") {
        console.log('RVN HIT')
        return await new Promise((resolve, reject) => {
            request({ url: 'https://rvn.2miners.com/api/stats' }, (err, res, body) => {
                if (err) {
                    reject(err)
                }
                let data = JSON.parse(body);
                let difficulty = data.nodes[0].difficulty;
                let hashrate = difficulty * Math.pow(2, 32) / 60;
                let Networkhashrate = hashrate / 1000000000000; // TH/s
                let Rent = Networkhashrate * (-percent / (-1 + percent))   // * 1000000 for MRR to MH/s
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ((difficulty * Math.pow(2, 32) / 60) + (1000000000000 * .01))
                resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate })
            })
        })
    }
}

exports.getPriceBtcUsd = async () => {
    let promise = new Promise((resolve, reject)=> {
        https.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC', (response) => {
        let todo = '';

        // called when a data chunk is received.
        response.on('data', (chunk) => {
            todo += chunk;
        })

        // called when the complete response is received.
        response.on('end', () => {
            resolve(JSON.parse(todo))
        })

        }).on("error", (error) => {
            console.log("Error: " + error.message);
            reject("Error: " + error.message)
        })
    })
    return promise
}