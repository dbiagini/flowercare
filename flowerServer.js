"use strict";
// Load the http module
var http = require('http');
var fs = require('fs'); //require filesystem module
var path = require('path');
var config = require('./config2pl_sim');
var gpio = null; 
var srv = require('./htmlServer');
var Pump = require('./pump.js');
var LED = require('./led.js');
var Plant = require('./plant.js');
console.log(" platform %s \n", process.platform);
if (process.platform != "win32") gpio = require('onoff').Gpio;
const server = new srv();

const timeOfStart = new Date(Date.now()).toLocaleString();
console.log(timeOfStart);



server.init();

//var PythonShell = require('python-shell');
/*var options = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	pythonOption: ['-u'],
	scriptPath: '/home/pi/miflora',
	args: 'dummy value', //config.plants[0].mac, //'C4:7C:8D:65:F8:FB', //mac address
};*/


var output= '';
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
	statusLED = new LED(4);//new gpio(4, 'out'); ///first pin as status led
	statusLED.Blink(); //starting up
}

///setup garden
var garden = [];
for (i = 0; i< config.plants.length; i++){
	garden.push(new Plant(config.plants[i]));
}
if(config.useSim) {
	console.log('Running Sensor simulation \n');
	for (i = 0; i< garden.length; i++){
		garden[i].initSimulation();
	}

}
for (var i = 0; i< config.plants.length; i++){
	//initialize GPIO
	if(config.irrigate && (process.platform != "win32")){
		garden[i].initPump();
		//config.plants[i].pump.writeSync(0); ///initialize the pump to 0
	}
	checkStatusInterval(garden[i]);
	if(!config.useSim){ 
		garden[i].initSensor(config.options);
		setInterval(checkStatusInterval, config.interval, garden[i]);//every half an hour(1.8M) update
	} else { 
		setInterval(checkStatusInterval, config.intervalSim, garden[i]);//every 10 minutes an hour update
		console.log('been here');
	}
	console.log('config: %j', garden[i]); //log plant status
}


server.start(config.plants); //pass the array of plants

if (process.platform != "win32") setTimeout(function() { 
	statusLED.endBlink(); 
	sensorStartingUp = false; //assume sensor settled 
} , 10000);
		
function checkStatusInterval(plant){
	//using a garden based function as the call to irrigate is based on garden status parameters which change from call to call, less efficient option
	var irrigate = false;
	if(config.irrigate && (!sensorStartingUp)) irrigate = true;
	plant.checkStatus(config.useSim, irrigate);

}

/*function checkStatusInterval(plant){
	if (!config.useSim){

		options.args = plant.mac;//only input variable
			PythonShell.run('demo.py', options, function (err,data){
			handlePostcheck(err, data, plant);
		});

	} else {

		//this runs only if the sensor simulation is being used
		//output="Temperature="+temperature.toString()+" Moisture="+moisture.toString()+" Sunlight= "+sunlight.toString()+" Fertility="+fertility.toString();
			//plant.temperature[0] -= Math.floor(Math.random() * 5);
			//plant.fertility[0] -= Math.floor(Math.random() * 5);
			//plant.sunlight[0] -= Math.floor(Math.random() * 5);
			plant.moisture[0] -= Math.floor(Math.random() * 10);
			//plant.battery[0]  -= Math.floor(Math.random()* 5);
			console.log('plant: %s, sim moisture %d ', plant.name, plant.moisture[0]);
		if(config.irrigate && (!sensorStartingUp)) {
			plant.checkIrrigate();
		} else {
			//debug string//
			if(config.debug) console.log('plant: %s status, moisture %d settling %d sensorStarted %d refuelCounter %d irrigate %b', plant.name, plant.moisture[0], plant.settling, sensorStartingUp, plant.refuelCounter, config.irrigate);
		}

	}

}*/

/*function handlePostcheck(err, output, plant){

	if(err){
		//handle errors from Python
		//Don't change Values
		//should print a warning in the page
		plant.updateLastWarning("Issue with connection to the sensor");
	} else {
		plant.updateStatus(output);		
	}
	//log in any case
	console.log('output: %j', output);

	if(config.irrigate && (!sensorStartingUp)) {
	
		plant.checkIrrigate();

	} else {
		//debug string//
		if(config.debug) { 
			
			plant.logStatus();
			console.log(' sensorStarted %d irrigate %b', sensorStartingUp, config.irrigate);
		}
	}


}*/


