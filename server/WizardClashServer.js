/*
 * Copyright (C) 2011 Alasdair Morrison <amorri40@gmail.com>
 *
 * This file is part of the 39js Library.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either 
 * version 2.1 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public 
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 */

var app = require('http').createServer(handler), io = require('socket.io')
		.listen(app), fs = require('fs');

io.configure('development', function(){
  io.set('destroy upgrade', false);
});

io.configure('production', function(){
  io.set('destroy upgrade', false);
});

// create the player array
var global={};
global.player = [];


app.listen(420); // open up tcpsocket

function handler(req, res) {
	fs.readFile(__dirname + '/index.html', function(err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}

		res.writeHead(200);
		res.end(data);
	});
}

io.sockets.on('connection', function(socket) { // basically the tcpaccept function

		// we need to send them their official ID
		var player_id = global.player.length;
		global.player.push( {
			player_id : player_id,
			x : 0,
			y : 0,
			tcp : socket
		})
		
		clearbuffer(); //send them their id
		writebyte(1);
		writebyte(player_id);
		sendmessage(socket);
		
		socket.on('message', function(data) {
			
			tcp = socket;
			buffer=data;
			messageid = readbyte();
			
			switch (messageid) {
			//case
			}

		});
	});
	
send_all_players=function() {
for (var player in global.player) {
	if (player) {
	sendmessage(global.player[player].tcp);
	}
	}		
}

/*
 * The 39js wrapper functions
 */
var buffer = [];
var messages = [];

dllinit = function() {
} // no init require atm
tcpconnect = function(serverip, serverport) {
	var sock = gmsocketio_connect(serverip + ":" + serverport);
	gmsocketio_recieve_callback(sock, "message", callback_39js);
	return sock;
}
clearbuffer = function() {
	buffer = [];
}
writeshort = writebyte = writestring = function(value) {
	buffer.push(value);
}

sendmessage = function(sock) {
	/*gmsocketio_send(sock, buffer);*/
	//server version
	sock.emit("message", buffer);
}
receivemessage = function(sock) {
	if (messages.length < 1)
		return 0;
	buffer = messages.pop();
	return buffer.length;
}

readshort = readstring = readbyte = function() {
	return buffer.shift();
}

callback_39js = function(data) {
	messages.push(data);
}

/*
 * The socketio functions
 */
var sockets = [];

var callbacks = {}

gmsocketio_connect = function(host) {
	sockets.push(io.connect(host));
	return sockets.length - 1;
}

gmsocketio_recieve_callback = function(id, event, callback) {
	if (!sockets[id])
		return;
	sockets[id].on(event, callback);
}

gmsocketio_recieve_script = function(id, event, scriptid) {
	if (!sockets[id])
		return;
	if (!callbacks[event])
		callbacks[event] = [];
	callbacks[event].push(scriptid);
	sockets[id].on(event, gmsocketio_actual_callback);
}

gmsocketio_recieve_once = function(id, event, callback) {
	if (!sockets[id])
		return;
	sockets[id].once(event,callback);
}

gmsocketio_send = function(id, message) {
	if (!sockets[id])
		return;
	sockets[id].emit("message", message);

}

gmsocketio_disconnect = function(id) {
	if (!sockets[id])
		return;
	sockets[id].disconnect();
	delete sockets[id];
}

gmsocketio_actual_callback = function(data) {
	gml_Script_gmsocketio_callback(data);
}
