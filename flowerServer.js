// Load the http module
var http = require('http');
var fs = require('fs'); //require filesystem module
var express = require('express');
var path = require('path');
var config = require('./config1pl');
//var config = require('./config2pl');
var gpio = null; 
console.log(" platform %s \n", process.platform);
if (process.platform != "win32") gpio = require('onoff').Gpio;
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
var statusLED = null;
var blinkInterval = null;
var sensorStartingUp = true;
if (process.platform != "win32") {
	statusLED = new gpio(4, 'out'); ///first pin as status led
	statusLED.writeSync(0); ///initialize the led to 0
	ledBlink();
}
if(config.useSim) {
	console.log('Running Sensor simulation \n');
	for (i = 0; i< config.plants.length; i++){
		config.plants[i].temperature[0] = config.plants[i].temperature[1];
		config.plants[i].fertility[0] = config.plants[i].fertility[1];
		config.plants[i].sunlight[0] = config.plants[i].sunlight[1];
		config.plants[i].moisture[0] = config.plants[i].moisture[1]+20;
		config.plants[i].battery[0] = config.plants[i].battery[1];
	}

}
for (i = 0; i< config.plants.length; i++){
	//initialize GPIO
	if(config.irrigate && (process.platform != "win32")){
		config.plants[i].pump = new gpio(config.plants[i].gpio, 'out');
		config.plants[i].pump.writeSync(0); ///initialize the pump to 0
	}
	checkStatusInterval(config.plants[i]);
	if(!config.useSim){ 
		setInterval(checkStatusInterval, 90000, config.plants[i]);//every half an hour(180k) update
	} else { 
		setInterval(checkStatusInterval, 20000, config.plants[i]);//every 10 minutes an hour update
		console.log('been here');
	}
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
if (process.platform != "win32") setTimeout(function() { endBlink(); } , 10000);

function checkStatusInterval(plant){
	if (!config.useSim){

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
		//plant.temperature[0] -= Math.floor(Math.random() * 5);
		//plant.fertility[0] -= Math.floor(Math.random() * 5);
		//plant.sunlight[0] -= Math.floor(Math.random() * 5);
		plant.moisture[0] -= Math.floor(Math.random() * 10);
		//plant.battery[0]  -= Math.floor(Math.random()* 5);
		console.log('plant: %s, sim moisture %d ', plant.name, plant.moisture[0]);
	}

	///after updating the status compare the water level and kick the refueling // plant settling is set true during the first irrigation and turned of when the 
	if(config.irrigate && (!sensorStartingUp)){	
		if ((((plant.moisture[0] <= plant.moisture[1]) && (!plant.settling)) || ((plant.moisture[0] > plant.moisture[1]) && (plant.moisture[0] < plant.moisture[2]) && (plant.settling))) && (plant.refuelCounter <= plant.maxUnits)){

				console.log('plant: %s needs refueling, moisture %d settling %d ', plant.name, plant.moisture[0], plant.settling);
				refuelPlant(plant);
		} else if (plant.moisture[0] >= plant.moisture[2]) {
			plant.settling = false; //finished refueling.
			plant.refuelCounter = 0;//reset limit counter
		} else if ((plant.moisture[0] <= plant.moisture[1]) && (plant.settling)){
		  ///something is wrong the refueling happened and it's not having effects
			plant.lastWarning = d.toUTCString() + "ERROR refueling failed or Sensor not responding";
			console.log('ERROR: plant: %s, sim moisture %d refueling or Sensor not working!!!', plant.name, plant.moisture[0]);

		} else if (plant.refuelCounter > plant.maxUnits){
			plant.lastWarning = d.toUTCString() + "ERROR irrigation units reached the limit";
			plant.settling = false; //let the plant settle.
			console.log('ERROR: plant: %s, sim moisture %d irrigation units reached the limit # %d !!!', plant.name, plant.moisture[0], plant.refuelCounter);
		}
	}
			  ///  (min<plant moisture<max) ||

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

function refuelPlant(plant){

	///
	plant.settling = true;
	diff = plant.moisture[2] - plant.moisture[0];
	units = Math.abs(Math.ceil(diff/20));//one unit is 25cl, increase ~20%  assuming linear model, simplistic
	if(units >= plant.maxUnits) units=plant.maxUnits; //limitate max irrigation
	plant.refuelCounter+= units;//increment limit counter
	console.log("refueling %d units \n", units);
	///irrigate n units
	if(plant.pump){

		/*if(!config.useSim)*/ pumpOn(plant.pump); //turn on plant
		/*if(!config.useSim)*/ setTimeout(pumpOff, (plant.unit * units), plant.pump);//turn it off later
		if(config.useSim) {
			plant.moisture[0] +=(20 * units);
		}
	}

	//console.log("plant new moisture %d \n", plant.moisture[0]);
}
function pumpToggle(pump){
	if(pump)
	{
		/*if(pump.readSync == 0){
	 		//pump is off
			if(!config.useSim) pump.writeSync(1);
			console.log("pump on");
		}
		else{
			if(!config.useSim) {
				pump.writeSync(0);
			}
			console.log("pump off");
		}*/

		pump.writeSync(statusLED.readSync() === 0 ? 1:0);
	} else console.log("no Pump \n");
}

function pumpOn(pump){
	if(pump)
	{
		pump.writeSync(1);
		console.log("Pump on \n");

	} else console.log("no Pump \n");
}

function pumpOff(pump){
	if(pump)
	{
		pump.writeSync(0);
		console.log("Pump off \n");
	} else console.log("no Pump \n");
}

function settled(plant){
	console.log("ground should be settled! \n");
	plant.settling = false; ///allow irrigating
}

function ledToggle(){
	if(statusLED)
	{
		/*var stat = statusLED.readSync();
		console.log("status LED %d \n", stat);
		if(stat == 0){
			statusLED.writeSync(1);
		}
		else{
			statusLED.writeSync(0);
		}*/
		statusLED.writeSync(statusLED.readSync() === 0 ? 1:0);
	} else console.log("status LED not working \n");
}

function ledOn(){
	if(statusLED)
	{
		statusLED.writeSync(1);
	} else console.log("status LED not working \n");
}

function ledOff(){
	if(statusLED)
	{
		statusLED.writeSync(0);
	} else console.log("status LED not working \n");
}

function ledBlink(){
	if(statusLED)
	{
		if(blinkInterval == null) blinkInterval = setInterval(ledToggle, 500);
		else console.log("blinking interval is already set");
	} else console.log("status LED not working \n");
}

function endBlink(){
	if(blinkInterval)
	{
		clearInterval(blinkInterval);
		statusLED.writeSync(1);
		blinkInterval = null;
		sensorStartingUp = false; //assume sensor settled 
	} else console.log("status LED not working \n");
}
