// Load the http module
var http = require('http');
var fs = require('fs'); //require filesystem module
var express = require('express');
var path = require('path');

var app = express();

app.use(express.static('public'))
//app.use(express.static(__dirname + '/public'));

var PythonShell = require('python-shell');
var options = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	pythonOption: ['-u'],
	scriptPath: '/home/pi/miflora',
	//args: ['value', 'value2', 'value3']
};
//var pyshell = new PythonShell(myPython);
var output= '';
var server;
var html;
var userCount=0;
var temp=0;
var fertility=0;
var sunlight=0;
var moisture=0;
setInterval(checkStatusInterval, 10000);//20Secs

//setTimeout(startHTMLServer, 10000);
//startHTMLServer();

startExpressServer();
/*function buildHtml(request){
	var header = "";
	var body = output;

	return '<!DOCTYPE html>' + '<html><header>' + header + '</header><body>' + body + '</body></html>';

}*/

function checkStatusInterval(){
	/*PythonShell.run('demo.py', options, function (err,output){
		if (err) throw err;
		///collect results
		console.log('output: %j', output);
	});*/
	output="Temperature="+temp.toString()+" Moisture="+moisture.toString()+" Sunlight= "+sunlight.toString()+" Fertility="+fertility.toString();
	temp++;
	fertility++;
	sunlight++;
	moisture++;

}

function startHTMLServer(){
//Configure http server to respond

server = http.createServer(httpHandler)

//Listen on port
server.listen(8000);
//Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
}

function httpHandler (request, response) { //create server
  fs.readFile('./index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      response.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return response.end("404 Not Found");
    }
    response.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    response.write(data); //write data from index.html
    response.write("We have "+userCount+" visits \n");
    response.write(" "+output+" \n");
    return response.end();
  });
}
function startExpressServer(){

	app.get('/', function(req, res) {
    		res.sendFile(path.join(__dirname + '/index.html'));
	});

	app.listen(8000);

	console.log("Server running at http://127.0.0.1:8000/");
}

