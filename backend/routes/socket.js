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
            }, 30000);
        }

            // let msg = JSON.stringify({ message: 'Cool Bean Socket from server started' })
            // ws.send(msg)
        
        ws.on('close', ()=> {
            console.log('Socket closed, and will reconnect')
        })
        ws.on('ping', (message)=> {
            console.log('SERVER PING', message)
        })
        ws.on('message', ( message )=> {
            console.log('message: SERVER', message)
            let obj = JSON.parse(message);
            console.log('obj:', obj)

            if (obj.keepAlive !== undefined) {
                pong();
            }
            if (obj.action === 'connect') {
                console.log('Server - joining', obj);
                //start pinging to keep alive
                ping();
            }

        })
    });
}
connect()



module.exports.wss = wss