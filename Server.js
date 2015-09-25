var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {}); //We do not serve HTML from this server. This is a strict communication only server.
server.listen(1337, function() { });

wsServer = new WebSocketServer({
    httpServer: server
});

var clients = [];
var count = 0;

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);
    var id = count++;
    clients.push({conn: connection, id: id})
    connection.sendUTF(JSON.stringify({type: 'id', id: id}))

    console.log("Connection accepted with id:" + id);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            //console.log("Sending: " + message.utf8Data);
            for(var i=0; i < clients.length; i++){
                //console.log(i);
                if(clients[i].id != id){
                    //console.log("sent to id: " + clients[i].id);
                    clients[i].conn.sendUTF(message.utf8Data);
                }
            }
        }
    });

    connection.on('close', function(connection) {
        console.log("Connection with id " + id + " was closed.");
        clients.splice(id,1);
    });
});