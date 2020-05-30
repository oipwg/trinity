//initialize a simple http server
const WebSocket = require('ws');
let wss = new WebSocket.Server({ port: 3031 });

/**
 * Works as a router, can be used in any other file as an instance of wss
 *  @event module
*/
function connect() {
    let keepAlive = null;

    wss.on('connection', (ws) => {
        function ping() {
            if (ws.readyState === 1) {
              ws.send('__ping__');
            } 
        }

        function pong() {
            console.log('Server - is still active');
            clearTimeout(keepAlive);
            keepAlive = setTimeout(function () {
            
                ping();
            }, 20000);
        }

        ws.on('close', ()=> {
            console.log('Socket closed, and will reconnect')
        })

        ws.on('message', ( message )=> {
            console.log('SERVER', message)
        })
    });
}
connect()



module.exports.wss = wss