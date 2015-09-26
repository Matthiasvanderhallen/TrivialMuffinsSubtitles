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

console.log('startup');

var subtitleInfo = {en: "", size: 72, panic: false};

var promptTitle = d3.select("#Prompter").selectAll("h1");

function onMessage(message){
  var json;

  console.log('received: '+ message.data);
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
  
  if(json.type == 'size'){
    subtitleInfo.size = json.size;
    setSize(json.size);
  }

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

function setSize(size){
  promptTitle.style("font-size", size + "px");
}

function showSubtitle(en){
  console.log('showing subtitle ' + en);
  prompt = promptTitle.data([en]);

  var returnText = function (d){
    console.log('returnText:' + d);
    if(subtitleInfo.panic){
      console.log('returnText: panic=' + subtitleInfo.panic);
      console.log('returnText: d=' + d);
      return d
    }else{
      console.log('returnText: panic=false');
      console.log('returnText: d=');
      return "";
    }
  }

  prompt.text(returnText);
}

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