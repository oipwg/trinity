const https = require('https');

exports.Rent = async (  token, percent) => {

    if (token === "FLO") {
        let Percent = percent / 100
        return await new Promise((resolve, reject) => {
            https.get('https://livenet.flocha.in/api/status?q=getInfos', (response) => {
                let body = ''
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    let data = JSON.parse(body)
                    if(!data) console.log('Data variable in rent function rentValues.js needs to have a catch for it, Flocha api is down!')
                    let difficulty = data.info.difficulty
                    let hashrate = difficulty * Math.pow(2, 32) / 40
                    let Networkhashrate = hashrate / 1000000000000;  // TH/s
                    let Rent = Networkhashrate * (-Percent / (-1 + Percent )) // * 1000000 for MRR to MH/s
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
        return await new Promise((resolve, reject) => {
            https.get('https://rvn.2miners.com/api/stats', (response) => {
              let body = ''
              response.on('data', (chunk) => {
                  body += chunk;
              });
              response.on('end', () => {
                let data = JSON.parse(body)
                if(!data) console.log('Something wrong with the api or syntax')
                let difficulty = data.nodes[0].difficulty;
                let hashrate = data.nodes[0].networkhashps;
                let Networkhashrate = hashrate / 1000000000000; 
                let Rent = Networkhashrate * (-percent / (-1 + percent)) 
                let MinPercentFromMinHashrate = 1000000000000 * .01 / ((difficulty * Math.pow(2, 32) / 60) + (1000000000000 * .01))
                resolve({ Rent, MinPercentFromMinHashrate, difficulty, Networkhashrate })
              })
        
              }).on("error", (error) => {
                console.log("Error: " + error.message);
                reject("Error: " + error.message)
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