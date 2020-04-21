const express = require('express');
const router = express.Router();
//initialize a simple http server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3031 });

wss.on('connection', function connection(ws) {
    wss.clients.forEach((client)=>{
        // console.log('CLIENTS',client)
    })
    // ws.on('message', function incoming(data) {
    //     console.log(wss.clients)  // prints if more than one client is on. \
        
    //     let msg = JSON.stringify({ hey: 'cool beans from server' })
    //     ws.send(msg);
    // })
    ws.on('close', ()=> {
        console.log('I lost a client')
    })
});


module.exports.wss = wss