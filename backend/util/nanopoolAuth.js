require('dotenv').config()
const request = require('request')

const api_base = 'https://api.nanopool.org/v1/rvn/balance/'
const raven_address = process.env.RAVEN_ADDRESS

const options = {
    method: 'GET',
    url: api_base + raven_address,
}

request(options, (err, res, body) => {
    if (err) return console.log(err)
    console.log(res.body)
    console.log(body)
})
