const express = require('express');
const router = express.Router();
//initialize a simple http server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3031 });

/**
 * Works as a router, can be used in any other file as an instance of wss
 *  @event module
*/
wss.on('connection', function connection(ws) {
    let msg = JSON.stringify({ hey: 'Cool Socket beans from server' })
    ws.send(msg)
    wss.clients.forEach((client)=>{
        // console.log('CLIENTS',client)
    })
    ws.on('close', ()=> {
        console.log('Socket closed')
    })
});


module.exports.wss = wss