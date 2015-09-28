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

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  } 
  return ""
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

	nederlands.html(returnText);
	frans.html(returnText);
};

function setVisibility(mode){
	if(mode == "nl"){
		d3.select("#separator").style("display", "none");
		d3.select("#Frans").style("display", "none");
		d3.select("#Nederlands").style("display", "flex");
	}
	if(mode == "fr"){
		d3.select("#separator").style("display", "none");
		d3.select("#Nederlands").style("display", "none");
		d3.select("#Frans").style("display", "flex");
	}
	if(mode == "dual"){
		d3.select("#separator").style("display", "block");
		d3.select("#Nederlands").style("display", "flex");
		d3.select("#Frans").style("display", "flex");
	}
};

var reconnect = inject(function(){
	var server = getQueryVariable('server');
	if(server == ""){
    	server = "localhost";
	}

	var connection = new WebSocket('ws://' + server + ':1337');
	connection.onmessage = onMessage;
	return connection;
});

var re = reconnect({}, function (stream) {
  // stream = the stream you should consume 
})
.on('connect', function (con) {
})
.connect();