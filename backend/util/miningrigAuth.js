const querystring = require('querystring');
const request = require('request');
const crypto = require('crypto');
let api_base = 'https://www.miningrigrentals.com/api/v2/';
let endpoint = "/account";


let keys = {
  api_key: '9d14bb91dd5a50dd4b4f3a74ea451013adb5d4b913def4d360049d57214171bf',
  api_secret: '6b78f1fc31577cf32c38d83fc55f6bb86de956940bf08848ea6efcdbf0ef3ec5',
  nonce: Date.now()
}

const nonce = keys.nonce
const signString = keys.api_key+nonce+endpoint;

const hmac = crypto.createHmac('sha1', keys.api_secret).update(signString).digest('hex')
console.log('hmac ', hmac)


const options = {
  method: 'POST',
  headers: {
    'x-api-sign': hmac,
    'x-api-key': keys.api_key,
    'x-api-nonce': nonce
  },
  url: api_base + 'account'
  // body: queryString
};

request(options, (err,res, body)=> {
  if(err) return console.log(err)
  console.log(res.body)
})