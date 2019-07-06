"use strict";
// Load the http module
var http = require('http');
var fs = require('fs'); //require filesystem module
var path = require('path');
var config = require('./config2pl_sim');
var gpio = null; 
var srv = require('./htmlServer');
var LED = require('./led.js');
var Plant = require('./plant.js');
console.log(" platform %s \n", process.platform);
if (process.platform != "win32") gpio = require('onoff').Gpio;
const server = new srv();

const timeOfStart = new Date(Date.now()).toLocaleString();
console.log(timeOfStart);



server.init();


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
		//setInterval(checkStatusInterval, config.interval, garden[i]);//every half an hour(1.8M) update
		setInterval(garden[i].checkStatus, config.interval, (config.irrigate && (!sensorStartingUp)));//every half an hour(1.8M) update
	} else { 
		//setInterval(checkStatusInterval, config.intervalSim, garden[i]);//every 10 minutes an hour update
		setInterval(garden[i].checkStatus, config.intervalSim, (config.irrigate && (!sensorStartingUp)));//every half an hour(1.8M) update
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

