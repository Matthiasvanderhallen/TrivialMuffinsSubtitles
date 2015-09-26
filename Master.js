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

var globalConnection;
//var connection = new WebSocket('ws://localhost:1337');

var nederlandsTitel = d3.select("#Nederlands").selectAll("h1");
var fransTitel = d3.select("#Frans").selectAll("h1");

var subtitle = {current: 0, nl: [], fr: [], en:[], length: 0, size: 72, panic: false};

d3.select("html").on('click', forward);
d3.select("body").on('keydown', keyListener);

function blackout(){
	nederlands = nederlandsTitel.data([""]);
	frans = fransTitel.data([""]);

	var black = function (d){
		return "";
	}

	nederlands.text(black);
	frans.text(black);

	globalConnection.send(JSON.stringify({type: "subtitle", nl: "", fr: "", en: getEnglish(subtitle.current)}));
};

function getEnglish(a){
	var preview = 1;
	var postview = 1;

	var enWindow = [];
	if(a-postview < 0){
		enWindow = subtitle.en.slice(a-postview);
		enWindow = enWindow.concat(subtitle.en.slice(0,a));
		enWindow = enWindow.concat(subtitle.en.slice(a, a+preview+1));
	}else{
		enWindow = subtitle.en.slice(a-postview, a+preview+1);
	}
	return enWindow;
}

function forward(){
	if(subtitle.current < subtitle.length){
		jumpTo(++subtitle.current);
	}
};

function backward(){
	if(subtitle.current > 0){
		jumpTo(--subtitle.current);
	}
};

function jumpTo(a) {
	nederlands = nederlandsTitel.data([subtitle.nl[a]]);
	frans = fransTitel.data([subtitle.fr[a]]);

	var returnText = function (d){
		return d;
	}

	nederlands.text(returnText);
	frans.text(returnText);

	globalConnection.send(JSON.stringify({type: "subtitle", nl:subtitle.nl[a], fr: subtitle.fr[a], en: getEnglish(a)}));			
};

function setSize(){
	nederlandsTitel.style("font-size", subtitle.size + "px");
	fransTitel.style("font-size", subtitle.size + "px");

	globalConnection.send(JSON.stringify({type: "size", size: subtitle.size}));
}

function keyListener(){
	if(d3.event.keyCode == 39){
		forward();
	} else if(d3.event.keyCode == 32){
		forward();
	} else if(d3.event.keyCode == 37){
		backward();
	} else if(d3.event.keyCode == 74){
		var answer = prompt("To what slide do you want to jump?", subtitle.current);

		if(isNumeric(answer) && answer < subtitle.length){
			subtitle.current = answer;
			jumpTo(subtitle.current);
		}
	} else if(d3.event.keyCode == 83){
		var answer = prompt("Which size?", subtitle.size);
		
		if(isNumeric(answer)){
			subtitle.size = answer;
			setSize();
		}
	} else if(d3.event.keyCode == 66){
		blackout();
	} else if(d3.event.keyCode == 73){
		globalConnection.send(JSON.stringify({type: "identify"}));
	} else if(d3.event.keyCode == 77){
		var mode = prompt("What mode (dual, fr, nl): ", "dual");
		var peer = prompt("What peer: ", 0);

		if(isNumeric(peer)){
			if(mode == "dual" || mode == "fr" || mode == "nl"){
				globalConnection.send(JSON.stringify({type: "mode", mode: mode, peer: peer}));
			}
		}
	} else if(d3.event.keyCode == 80){
		subtitle.panic = !subtitle.panic;
		globalConnection.send(JSON.stringify({type: "panic", panic: subtitle.panic}));
	}
};

function isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
};

var pipeParser = d3.dsv("|", "text/plain");
pipeParser("ondertitels.txt", parseData);

function sanatize(subtitle){
	if(subtitle==undefined){
		subtitle = "";
	}

	return subtitle.trim().split('//')[0];
}

function parseData(data){
	for(var i = 0; i < data.length; i++){
		subtitle.nl.push(sanatize(data[i].nederlands));
		subtitle.fr.push(sanatize(data[i].frans));
		subtitle.en.push(sanatize(data[i].engels));
	}

	subtitle.length = data.length;

	jumpTo(0);
};

var reconnect = inject(function(){
	var connection = new WebSocket('ws://localhost:1337');
	globalConnection = connection;
	return connection;
});

var re = reconnect({}, function (stream) {
  // stream = the stream you should consume 
})
.on('connect', function (con) {
})
.connect();