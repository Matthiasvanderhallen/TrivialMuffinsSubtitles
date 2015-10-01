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

var globalConnection;
//var connection = new WebSocket('ws://localhost:1337');

var nederlandsTitel = d3.select("#Nederlands").selectAll("h1");
var fransTitel = d3.select("#Frans").selectAll("h1");
var engelsTitel = d3.select("#original").selectAll("h2");

var subtitle = {current: 0, nl: [], fr: [], en:[], length: 0, size: 72, panic: false, preview: 1, postview: 1, blackout: false};

d3.select("html").on('click', forward);
d3.select("body").on('keydown', keyListener);

function getEnglish(a, preview, postview){
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
	engels = engelsTitel.data(getEnglish(a, 3, 3));


	var returnText = function (d){
		return d;
	}

	var returnCheckBlackout = function(d){
		if(subtitle.blackout){
			return "";
		}
		return d;
	}

	nederlands.text(returnCheckBlackout);
	frans.text(returnCheckBlackout);
	engels.text(returnText);

	globalConnection.send(JSON.stringify({type: "subtitle", nl:returnCheckBlackout(subtitle.nl[a]), fr: returnCheckBlackout(subtitle.fr[a]), en: getEnglish(a, subtitle.preview, subtitle.postview)}));
};

function setSize(){
	//nederlandsTitel.style("font-size", subtitle.size + "px");
	//fransTitel.style("font-size", subtitle.size + "px");

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
		subtitle.blackout = !subtitle.blackout;
		jumpTo(subtitle.current);
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
		if(subtitle.panic){
			d3.selectAll(".panic").style('display', 'block');
		}else{
			d3.selectAll(".panic").style('display', 'none');
		}
	} 
	/*else if(d3.event.keycode == 83){
		var preview = prompt("Preview?", subtitle.preview);
		var postview = prompt("Postview?", subtitle.postview);


	}*/
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
	var server = getQueryVariable('server');
	if(server == ""){
    	server = "localhost";
	}

	var connection = new WebSocket('ws://' + server + ':1337');
	globalConnection = connection;
	return connection;
});

var re = reconnect({}, function (stream) {
  // stream = the stream you should consume 
})
.on('connect', function (con) {
})
.connect();