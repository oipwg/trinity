require('dotenv').config();
const querystring = require('querystring');
const request = require('request');
const crypto = require('crypto');
let api_base = 'https://www.miningrigrentals.com/api/v2/';
let endpoint = "/account";
console.log(process.env)

let keys = {
  api_key: process.env.MININGRENTAL_KEY,
  api_secret: process.env.MININGRENTAL_SECRET,
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