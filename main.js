// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// node websocket-relay yoursecret 8081 8082
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret

var fs = require('fs'),
	http = require('https'),
	WebSocket = require('ws');

var STREAM_SECRET = process.argv[2],
	STREAM_PORT = process.argv[3] || 8081,
	WEBSOCKET_PORT = process.argv[4] || 8082,
	RECORD_STREAM = false;

// Websocket Server

var options = {
    key: fs.readFileSync("/etc/letsencrypt/live/thesneekhub.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/thesneekhub.com/fullchain.pem")
};


var streamServer = http.createServer(options,function(request, response) {

	var params = request.url.substr(1).split('/');
	if(request.url === "/"){
      		response.writeHead(200, { 'Content-Type':'text/html'});
      		response.end("<div><p>Test<p></div>");
   	}

	
	console.log(
		'Stream Connected: ' +
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		var p = request.url.toString()
		if(p1 === p){
		socketServer.broadcast(data);
		if (request.socket.recording) {
			request.socket.recording.write(data);
		}
		}
	});
	request.on('end',function(e){
		console.log('close',e);
		if (request.socket.recording) {
			request.socket.recording.close();
		}
	});

	// Record the stream to a local file?
	if (RECORD_STREAM) {
		var path = 'recordings/' + Date.now() + '.ts';
		request.socket.recording = fs.createWriteStream(path);
	}
})
var p1
var socketServer = new WebSocket.Server({server:streamServer});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket, upgradeReq) {
	const urlParams = new URLSearchParams(upgradeReq.url.replace('/?', ''));
        const dynamicParam = urlParams.get('param')
        p1 = "/"+dynamicParam
	socketServer.connectionCount++;
	console.log(
		'New WebSocket Connection: ',
		(upgradeReq || socket.upgradeReq).socket.remoteAddress,
		(upgradeReq || socket.upgradeReq).headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
	socketServer.clients.forEach(function each(client) {
		if ((client.readyState === WebSocket.OPEN)) {
			client.send(data);
		}
	});
};

// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg


// Keep the socket open for streaming
streamServer.headersTimeout = 0;
streamServer.listen(STREAM_PORT);

console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
