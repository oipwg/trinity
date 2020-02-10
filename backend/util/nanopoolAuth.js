
const request = require('request')

const api_base = 'https://api.nanopool.org/v1/rvn/balance/';
const raven_address = 'RCF1bfzwJb2saQ6JSPtcWrZ2eTP7i45UC4'

const options = {
  method: 'GET',
  url: api_base+raven_address
};

request(options, (err,res, body)=> {
  if(err) return console.log(err)
  console.log(res.body)
  console.log(body)
})