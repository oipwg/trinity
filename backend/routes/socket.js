const express = require('express');
const router = express.Router();
//initialize a simple http server
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 3031 });

// wss.on('connection', function connection(ws) {
//     ws.on('message', function incoming(data) {
//         console.log('data:', data)
        // console.log(wss.clients)  // prints if more than one client is on. 
//         let msg = JSON.stringify({hey: 'cool beans from server'})
//         ws.send(msg);
//     })
// });


module.exports = router;