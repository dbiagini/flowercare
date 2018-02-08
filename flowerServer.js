// Load the http module
var http = require('http');

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
setInterval(checkStatusInterval, 20000);//20Secs

setTimeout(startHTMLServer, 10000);

function buildHtml(request){
	var header = "";
	var body = output;

	return '<!DOCTYPE html>' + '<html><header>' + header + '</header><body>' + body + '</body></html>';

}

function checkStatusInterval(){
	PythonShell.run('demo.py', options, function (err,output){
		if (err) throw err;
		///collect results
		console.log('output: %j', output);
	});

}

function startHTMLServer(){
//Configure http server to respond
server = http.createServer(function (request, response) {
	html = buildHtml(request);
	response.writeHead(200, {
		"Content-Type": "text/html",
		"Content-Length": html.length,
		"Expires": new Date().toUTCString()
	});
response.end(html);
});
//Listen on port
server.listen(8000);
//Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
}


