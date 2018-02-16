// Load the http module
var http = require('http');
var fs = require('fs'); //require filesystem module
var express = require('express');
var path = require('path');
var config =require('./config');
var pythonSim = config.useSim;

var app = express();

app.use(express.static('public'))
//app.use(express.static(__dirname + '/public'));

//set the view engine to ejs
app.set('view engine', 'ejs');

var PythonShell = require('python-shell');
var options = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	pythonOption: ['-u'],
	scriptPath: '/home/pi/miflora',
	args: config.plants[0].mac, //'C4:7C:8D:65:F8:FB', //mac address
};

console.log('config: %j', config.plants[0]);
//var pyshell = new PythonShell(myPython);
var output= '';
var server;
var html;
var userCount = 0;
var name = config.plants[0].name;
var temperature = config.plants[0].temperature[0];
var fertility = config.plants[0].fertility[0];
var sunlight = config.plants[0].sunlight[0];
var moisture = config.plants[0].moisture[0];
var battery = config.plants[0].battery[0];
var lastWarning = "";
//var lastError = "";

checkStatusInterval();
//setInterval(checkStatusInterval, 60000);//once a minute

//setTimeout(startHTMLServer, 10000);
//startHTMLServer();

startExpressServer();
/*function buildHtml(request){
	var header = "";
	var body = output;

	return '<!DOCTYPE html>' + '<html><header>' + header + '</header><body>' + body + '</body></html>';

}*/

///not used
/*function errPyCallback(err,data) {
	if(err){
		//handle errors from Python
		//Don't change Values
		//should print a warning in the page
		d = new Date();
		lastWarning = d.toUTCString() + "Issue with connection to the sensor";
	} else {
			temperature = data[0];
			moisture = data[1];
			sunlight = data[2];
			fertility = data[3];
			battery = data[4];
			lastWarning = "";
	}
	//log in any case
	console.log('output: %j', data);
}*/

function checkStatusInterval(){
	if (!pythonSim){
		PythonShell.run('demo.py', options, function (err,output){
			if(err){
				//handle errors from Python
				//Don't change Values
				//should print a warning in the page
				d = new Date();
				lastWarning = d.toUTCString() + "Issue with connection to the sensor";
			} else {
					temperature = output[0];
					moisture = output[1];
					sunlight = output[2];
					fertility = output[3];
					battery = output[4];
			}
			//log in any case
			console.log('output: %j', output);
		});
		/*PythonShell.run('demo.py', options, function (err,data){
			errPyCallback(err,data);
		});*/
		setTimeout(checkStatusInterval, 60000); ///call yourself 

	} else {
	//output="Temperature="+temperature.toString()+" Moisture="+moisture.toString()+" Sunlight= "+sunlight.toString()+" Fertility="+fertility.toString();
		temperature= Math.floor(Math.random() * 100);
		fertility= Math.floor(Math.random() * 100);
		sunlight= Math.floor(Math.random() * 100);
		moisture= Math.floor(Math.random() * 100);
	}

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

	//register index
	app.get('/', function(req, res) {
    		//res.sendFile(path.join(__dirname + '/index.html'));
		res.render('pages/index',{
			name: name,
			temperature: temperature,
			moisture: moisture,
			sunlight: sunlight,
			fertility: fertility,
			battery: battery,
			lastWarning: lastWarning,
		});
	});
	//register the about page
	app.get('/about', function(req, res) {
    		//res.sendFile(path.join(__dirname + '/pages/about.html'));

		res.render('pages/about');
	});


	app.listen(8000);

	console.log("Server running at http://127.0.0.1:8000/");
}

