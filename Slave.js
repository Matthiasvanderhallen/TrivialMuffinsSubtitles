var inject = require('reconnect-core');

window.WebSocket = window.WebSocket || window.MozWebSocket;

window.WebSocket.prototype.on = function (event, callback) {
  this['on'+event] = callback;
  return this;
};

window.WebSocket.prototype.once = function (event, callback) {
  var self = this;
  this['on'+event] = function () {
    callback.apply(callback, arguments);
    self['on'+event] = null;
  };
  return this;
};


window.WebSocket.prototype.off = function (event, callback) {
  this['on'+event] = callback;
  return this;
};

window.WebSocket.prototype.removeListener = function (event, callback) {
	this['on'+event] = null;
}

//var connection = new WebSocket('ws://localhost:1337');
//connection.onmessage = onMessage;

var nederlandsTitel = d3.select("#Nederlands").selectAll("h1");
var fransTitel = d3.select("#Frans").selectAll("h1");

var id;

var subtitleInfo = {nl: "", fr: "", size: 72, mode: "dual"};

function onMessage(message){
	var json;

	try{
		json = JSON.parse(message.data);
	}catch (e) {
		console.log(message.data);
    	return;
	}

	if(json.type == 'id'){
		id = json.id;
	}

	if(json.type == 'subtitle'){
		subtitleInfo.nl = json.nl;
		subtitleInfo.fr = json.fr;
		showSubtitle(json.nl, json.fr);
	}
	
	if(json.type == 'size'){
		subtitleInfo.size = json.size;
		setSize(json.size);
	}

	if(json.type == 'mode'){
		if(json.peer == id){
			subtitleInfo.mode = json.mode;
			setVisibility(json.mode);
		}
	}

	if(json.type == 'identify'){
		identify();
	}
};

function identify(){
	setVisibility("dual");
	showSubtitle(id,id);
	setTimeout(showSubtitle, 500, subtitleInfo.nl, subtitleInfo.fr);
	setTimeout(setVisibility, 500, subtitleInfo.mode);
};

function setSize(size){
	nederlandsTitel.style("font-size", size + "px");
	fransTitel.style("font-size", size + "px");
}

function showSubtitle(nl, fr) {
	nederlands = nederlandsTitel.data([nl]);
	frans = fransTitel.data([fr]);

	var returnText = function (d){
		return d;
	}

	nederlands.text(returnText);
	frans.text(returnText);
};

function setVisibility(mode){
	if(mode == "nl"){
		d3.select("#separator").style("visibility", "collapse");
		d3.select("#Frans").style("visibility", "collapse");
	}
	if(mode == "fr"){
		d3.select("#separator").style("visibility", "collapse");
		d3.select("#Nederlands").style("visibility", "collapse");
	}
	if(mode == "dual"){
		d3.select("#separator").style("visibility", "visible");
		d3.select("#Nederlands").style("visibility", "visible");
		d3.select("#Frans").style("visibility", "visible");
	}
};

var reconnect = inject(function(){
	var connection = new WebSocket('ws://localhost:1337');
	connection.onmessage = onMessage;
	return connection;
});

var re = reconnect({}, function (stream) {
  // stream = the stream you should consume 
})
.on('connect', function (con) {
})
.connect();