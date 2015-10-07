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

//Var containing the connection
var globalConnection;

//D3 - Subtitles:
var nederlandsTitel = d3.select("#Nederlands").selectAll("h1");
var fransTitel = d3.select("#Frans").selectAll("h1");
var engelsTitel = d3.select("#original").selectAll("h2");

//D3 - Menu Bar
var panicBadge = d3.selectAll(".panic");
var blackoutBadge = d3.selectAll(".blackout");
var slideBadge = d3.select("#slide");
var downloadButton = d3.select("btn-real");

//General subtitle information data
var subtitle = {current: 0, nl: [], fr: [], en:[], length: 0, size: 72, panic: false, preview: 1, postview: 1, blackout: false};

//D3 setting up the listeners.
d3.select("#btn-real").on('click', downloadLog);
d3.select("body").on('click', forward);
d3.select("body").on('keydown', keyListener);

function downloadLog(){
	d3.event.stopPropagation();
	globalConnection.send(JSON.stringify({type:"list"}));
}

function showList(list){
	var options = [];
	for(i = 0; i<list.length; i++){
		if(/.*.log/.test(list[i])){
			options.push("<option value='logs/" + list[i] + "'>" + list[i] + "</option>");
		}
	}

	$("#FileSelector").append(options.join("")).selectmenu({
		appendTo: "#DownloadDialog",
		height: "auto",
		width: 200
	});

	$("#DownloadDialog").dialog("open");
}

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
	slide = slideBadge.data([a]);


	var returnText = function (d){
		return d;
	}

	var returnCheckBlackout = function(d){
		if(subtitle.blackout){
			return "";
		}
		return d;
	}

	var returnSlideText = function(d){
		return d + "/" + subtitle.length;
	}

	nederlands.html(returnCheckBlackout);
	frans.html(returnCheckBlackout);
	engels.html(returnText);
	slide.html(returnSlideText);

	globalConnection.send(JSON.stringify({type: "subtitle", nl:returnCheckBlackout(subtitle.nl[a]), fr: returnCheckBlackout(subtitle.fr[a]), en: getEnglish(a, subtitle.preview, subtitle.postview)}));
	globalConnection.send(JSON.stringify({type: "note", data: "*** " + Date.now() + " ** " + a}));
};

function setSize(){
	//nederlandsTitel.style("font-size", subtitle.size + "px");
	//fransTitel.style("font-size", subtitle.size + "px");

	globalConnection.send(JSON.stringify({type: "size", size: subtitle.size}));
}

function keyListener(){

	var LEFT = 37;
	var RIGHT = 39;
	var SPACE = 32;
	var KEY_J = 74;
	var KEY_S = 83;
	var KEY_B = 66;
	var KEY_I = 73;
	var KEY_M = 77;
	var KEY_P = 80;
	var KEY_N = 78;
	var KEY_C = 67;

	if(d3.event.keyCode == RIGHT){
		forward();
	} else if(d3.event.keyCode == SPACE){
		forward();
	} else if(d3.event.keyCode == LEFT){
		backward();
	} else if(d3.event.keyCode == KEY_J){
		var answer = prompt("To what slide do you want to jump?", subtitle.current);

		if(isNumeric(answer) && answer <= subtitle.length){
			subtitle.current = answer;
			jumpTo(subtitle.current);
		}
	} else if(d3.event.keyCode == KEY_S){
		var answer = prompt("Which size?", subtitle.size);
		
		if(isNumeric(answer)){
			subtitle.size = answer;
			setSize();
		}
	} else if(d3.event.keyCode == KEY_B){
		subtitle.blackout = !subtitle.blackout;
		if(subtitle.blackout){
			blackoutBadge.style('visibility', 'visible');
		}else{
			blackoutBadge.style('visibility', 'hidden');
		}

		jumpTo(subtitle.current);
	} else if(d3.event.keyCode == KEY_I){
		globalConnection.send(JSON.stringify({type: "identify"}));
	} else if(d3.event.keyCode == KEY_M){
		var mode = prompt("What mode (dual, fr, nl): ", "dual");
		var peer = prompt("What peer: ", 0);

		if(isNumeric(peer)){
			if(mode == "dual" || mode == "fr" || mode == "nl"){
				globalConnection.send(JSON.stringify({type: "mode", mode: mode, peer: peer}));
			}
		}
	} else if(d3.event.keyCode == KEY_P){
		subtitle.panic = !subtitle.panic;
		if(subtitle.panic){
			panicBadge.style('visibility', 'visible');
		}else{
			panicBadge.style('visibility', 'hidden');
		}

		globalConnection.send(JSON.stringify({type: "panic", panic: subtitle.panic}));
	} else if(d3.event.keyCode == KEY_C){
		var filename = prompt("Filename?");

		slideBadge.attr("class", "rec");
		globalConnection.send(JSON.stringify({type: "create", filename: filename}));
	}else if(d3.event.keyCode == KEY_N){
		globalConnection.send(JSON.stringify({type: "note", data: subtitle.current}));
	}
	/*else if(d3.event.keycode == 83){
		var preview = prompt("Preview?", subtitle.preview);
		var postview = prompt("Postview?", subtitle.postview);


	}*/
};

function onMessage(message){
	var json;

	try{
		json = JSON.parse(message.data);
	} catch(e){
		console.log(e);
		console.log(message.data);
		return;
	}

	if(json.type == "listResponse"){
		console.log(json);
		console.log(json.list);
		showList(json.list);
	}
}

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
	connection.onmessage = onMessage;
	return connection;
});

var re = reconnect({}, function (stream) {
  // stream = the stream you should consume 
})
.on('connect', function (con) {
})
.connect();


//JQUERY setup
$(document).ready(function(){
	$("#DownloadDialog").dialog({
		autoOpen: false,
		modal: true,
		width: "auto",
		height: "auto",
        buttons: {
            "Ok": function(e) {
            	e.preventDefault();
				window.open($("#FileSelector option:selected").val());
            	event.stopPropagation();
                $(this).dialog("close");
            },
            "Cancel": function() {
            	event.stopPropagation();
                $(this).dialog("close");
            }
        },
        open: function(){
        	d3.select("body").on('click', null);
        },
        close: function(){
        	d3.select("body").on('click', forward);
        }
	});
});