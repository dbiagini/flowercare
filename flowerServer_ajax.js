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

PythonShell.run('demo.py', options, function (err,output){
if (err) throw err;
///collect results
console.log('output: %j', output);
});

//Configure http server to respond
var server = http.createServer(function (request, response) {
	var html = buildHtml(request);
	response.writeHead(200, {
		de
		"Content-Type": "text/html",
		"Content-Length": html.length,
		"Expires": new Date().toUTCString()
	});
response.end(html);
});

function buildHtml(request){
	var header = "";
	var body = output;

	return '<!DOCTYPE html>' + '<html><header>' + header + '</header><body>' + body + '</body></html>';

}

//Listen on port
server.listen(8000);

//Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");
