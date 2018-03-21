// Load the http module
var http = require('http');
var fs = require('fs'); //require filesystem module
var express = require('express');
var path = require('path');
var config =require('./config2pl');
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
	args: 'dummy value', //config.plants[0].mac, //'C4:7C:8D:65:F8:FB', //mac address
};


/*plant0 = {
	name : "Kawa",
	temperature : [0,18], // |actual|min|
	fertility : [0,300],
	sunlight : [0,1000],
	moisture : [0,15],
	battery : [0,10],
	lastWarning : "",
	mac : 'C4:7C:8D:65:F8:FB', //mac address
};*/

//var pyshell = new PythonShell(myPython);
var output= '';
var server;
var html;
var userCount = 0;
var name = ""; //config.plants[0].name;
var temperature = 0;//config.plants[0].temperature[0];
var fertility = 0;//config.plants[0].fertility[0];
var sunlight = 0;//config.plants[0].sunlight[0];
var moisture = 0;//config.plants[0].moisture[0];
var battery = 0;//config.plants[0].battery[0];
var lastWarning = "";
//var lastError = "";

if(config.useSim) {
	console.log('Running Sensor simulation \n');
	for (i = 0; i< config.plants.length; i++){
		config.plants[i].temperature[0] = config.plants[i].temperature[1];
		config.plants[i].fertility[0] = config.plants[i].fertility[1];
		config.plants[i].sunlight[0] = config.plants[i].sunlight[1];
		config.plants[i].moisture[0] = config.plants[i].moisture[1];
		config.plants[i].battery[0] = config.plants[i].battery[1];
	}

}
for (i = 0; i< config.plants.length; i++){
	checkStatusInterval(config.plants[i]);
	setInterval(checkStatusInterval, 10000, config.plants[i]);//once a minute
	console.log('config: %j', config.plants[i]);
}

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

function checkStatusInterval(plant){
	if (!pythonSim){

		options.args = plant.mac;//only input variable
		PythonShell.run('demo.py', options, function (err,output){
			if(err){
				//handle errors from Python
				//Don't change Values
				//should print a warning in the page
				d = new Date();
				plant.lastWarning = d.toUTCString() + "Issue with connection to the sensor";
			} else {
					plant.temperature[0] = output[0];
					plant.moisture[0] = output[1];
					plant.sunlight[0] = output[2];
					plant.fertility[0] = output[3];
					plant.battery[0] = output[4];
			}
			//log in any case
			console.log('output: %j', output);
		});
		/*PythonShell.run('demo.py', options, function (err,data){
			errPyCallback(err,data);
		});*/

	} else {
	//output="Temperature="+temperature.toString()+" Moisture="+moisture.toString()+" Sunlight= "+sunlight.toString()+" Fertility="+fertility.toString();
		plant.temperature[0] -= Math.floor(Math.random() * 5);
		plant.fertility[0] -= Math.floor(Math.random() * 5);
		plant.sunlight[0] -= Math.floor(Math.random() * 5);
		plant.moisture[0] -= Math.floor(Math.random() * 5);
		plant.battery[0]  -= Math.floor(Math.random()* 5);
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
		res.render('pages/indexPl',{
			plants: config.plants,
		});
	});
	//register the about page
	app.get('/about', function(req, res) {

		res.render('pages/about');
	});


	app.listen(8000);

	console.log("Server running at http://127.0.0.1:8000/");
}

