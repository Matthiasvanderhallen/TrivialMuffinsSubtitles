var WebSocketServer = require('websocket').server;
var http = require('http');
var HashMap = require('hashmap');
var fs = require('fs');

var server = http.createServer(function(request, response) {}); //We do not serve HTML from this server. This is a strict communication only server.
server.listen(1337, function() { });

wsServer = new WebSocketServer({
    httpServer: server
});

var clients = [];
var count = 0;
var logs = new HashMap();

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
            try{
                json = JSON.parse(message.utf8Data);
                
                if(json.type == "create") {
                    stream = fs.createWriteStream(__dirname + "/logs/"+json.filename + ".log", {flags: 'a', defaultEncoding: 'utf8', fd: null});
                    stream.on('error', function(err) {
                        console.log(err);
                    });
                    logs.set(this, stream);
                    //open("log/" + message.filename, 'a', function(err,file){

                    return;
                } else if(json.type == "note") {
                    if(logs.has(this)){
                        logs.get(this).write(json.data + "\n");
                    }

                    return;
                } else if(json.type == "list"){
                    var callback = function(err, files){
                        connection.sendUTF(JSON.stringify({type:"listResponse", list:files}));
                    }

                    fs.readdir("logs/", callback);
                    return;
                }
            }catch (e){}

            passOn(message, id);
        }
    });

    connection.on('close', function(connection) {
        if(logs.has(this)){
            logs.get(this).close();
        }
        console.log("Connection with id " + id + " was closed.");
        clients.splice(id,1);
    });
});

function passOn(message, id){
    console.log("Sending: " + message.utf8Data);
    for(var i=0; i < clients.length; i++){
        //console.log(i);
        if(clients[i].id != id){
            //console.log("sent to id: " + clients[i].id);
            clients[i].conn.sendUTF(message.utf8Data);
        }
    }
}