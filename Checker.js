var nederlandsTitel = d3.select("#Nederlands").selectAll("h1");

var subtitle = {current: 0, nl: [], fr: [], en:[], length: 0, size: 72, panic: false, preview: 1, postview: 1};

d3.select("html").on('click', forward);
d3.select("body").on('keydown', keyListener);

function blackout(){
	nederlands = nederlandsTitel.data([""]);

	var black = function (d){
		return "";
	}

	nederlands.text(black);

};

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

	var returnText = function (d){
		return d;
	}

	nederlands.text(returnText);
};

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
	} else if(d3.event.keyCode == 66){
		blackout();
	} 
};

function isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
};

var pipeParser = d3.dsv("|", "text/plain");
//var answer = prompt("Paste the text you want to test?");
//pipeParser.parseRows(answer, parseData);

function sanatize(subtitle){
	if(subtitle==undefined){
		subtitle = "";
	}

	return subtitle.trim().split('//')[0];
}

function parseData(data){
	console.log('subtitle');
	subtitle.nl.push(sanatize(data[1]));
	console.log(subtitle.nl);
	
	subtitle.length = subtitle.nl.length;

	jumpTo(0);
};

$(function() {
    $("#dialog-form").dialog({
        autoOpen: true,
        modal: true,
        width: "auto",
        height: "auto",
        buttons: {
            "Ok": function() {
                pipeParser.parseRows($("#subtitles").val(), parseData);
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            }
        }
    });
});