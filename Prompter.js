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

var subtitleInfo = {en: "", size: 72, panic: false};

var promptTitle = d3.select("#Prompter").selectAll("h1");

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
    subtitleInfo.en = json.en;
    showSubtitle(json.en);
  }
  
  /*if(json.type == 'size'){
    subtitleInfo.size = json.size;
    setSize(json.size);
  }*/

  if(json.type == 'panic'){
    subtitleInfo.panic = json.panic;
    showSubtitle(subtitleInfo.en);
  }

  if(json.type == 'identify'){
    identify();
  }
};

function identify(){
  var temp = subtitleInfo.panic;
  subtitleInfo.panic = true;
  showSubtitle(id);
  setTimeout(function(){
    subtitleInfo.panic = temp;
    showSubtitle(subtitleInfo.en);
  }, 500);
};

/*function setSize(size){
  promptTitle.style("font-size", size + "px");
}*/

function showSubtitle(en){
  prompt = promptTitle.data(en);

  var returnText = function (d){
    if(subtitleInfo.panic){
      return d
    }else{
      return "";
    }
  }

  prompt.text(returnText);
}

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