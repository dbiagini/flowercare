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
console.log(" platform %s \n", process.platform);
if (process.platform != "win32") gpio = require('onoff').Gpio;
const server = new srv();

const timeOfStart = new Date(Date.now()).toLocaleString();
console.log(timeOfStart);



server.init();

var PythonShell = require('python-shell');
var options = {
	mode: 'text',
	pythonPath: '/usr/bin/python3',
	pythonOption: ['-u'],
	scriptPath: '/home/pi/miflora',
	args: 'dummy value', //config.plants[0].mac, //'C4:7C:8D:65:F8:FB', //mac address
};


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
for (var i = 0; i< config.plants.length; i++){
	//initialize GPIO
	if(config.irrigate && (process.platform != "win32")){
		config.plants[i].pump = new Pump(config.plants[i].gpio);//new gpio(config.plants[i].gpio, 'out');
		//config.plants[i].pump.writeSync(0); ///initialize the pump to 0
	}
	checkStatusInterval(config.plants[i]);
	if(!config.useSim){ 
		setInterval(checkStatusInterval, config.interval, config.plants[i]);//every half an hour(1.8M) update
	} else { 
		setInterval(checkStatusInterval, config.intervalSim, config.plants[i]);//every 10 minutes an hour update
		console.log('been here');
	}
	console.log('config: %j', config.plants[i]);
}


server.start(config.plants); //pass the array of plants

if (process.platform != "win32") setTimeout(function() { 
	statusLED.endBlink(); 
	sensorStartingUp = false; //assume sensor settled 
} , 10000);
		

function checkStatusInterval(plant){
	if (!config.useSim){

		options.args = plant.mac;//only input variable
			PythonShell.run('demo.py', options, function (err,data){
			handlePostcheck(err, data, plant);
		});

	} else {
	//output="Temperature="+temperature.toString()+" Moisture="+moisture.toString()+" Sunlight= "+sunlight.toString()+" Fertility="+fertility.toString();
		//plant.temperature[0] -= Math.floor(Math.random() * 5);
		//plant.fertility[0] -= Math.floor(Math.random() * 5);
		//plant.sunlight[0] -= Math.floor(Math.random() * 5);
		plant.moisture[0] -= Math.floor(Math.random() * 10);
		//plant.battery[0]  -= Math.floor(Math.random()* 5);
		console.log('plant: %s, sim moisture %d ', plant.name, plant.moisture[0]);
		checkIrrigate(plant);
	}

}

function handlePostcheck(err, output, plant){

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

	checkIrrigate(plant); //values should be updated by now.

}

function checkIrrigate(plant){
///after updating the status compare the water level and kick the refueling // plant settling is set true during the first irrigation and turned of when the 
	if(config.irrigate && (!sensorStartingUp)){	
		if ((((plant.moisture[0] <= plant.moisture[1]) && (!plant.settling)) || ((plant.moisture[0] > plant.moisture[1]) && (plant.moisture[0] < plant.moisture[2]) && (plant.settling))) && (plant.refuelCounter <= plant.maxUnits)){

				console.log('plant: %s needs refueling, moisture %d settling %d ', plant.name, plant.moisture[0], plant.settling);
				refuelPlant(plant);
		} else if ((plant.moisture[0] >= plant.moisture[2]) && (plant.settling)) {
			plant.settling = false; //finished refueling.
			plant.refuelCounter = 0;//reset limit counter
			console.log('plant: %s finished refueling, moisture %d settling %d ', plant.name, plant.moisture[0], plant.settling);
		} else if ((plant.moisture[0] <= plant.moisture[1]) && (plant.settling)){
		  ///something is wrong the refueling happened and it's not having effects
			d = new Date();
			plant.lastWarning = d.toUTCString() + " ERROR refueling failed or Sensor not responding";
			console.log('ERROR: plant: %s, moisture %d refueling or Sensor not working!!!', plant.name, plant.moisture[0]);

		} else if (plant.refuelCounter > plant.maxUnits){
			d = new Date();
			plant.lastWarning = d.toUTCString() + " ERROR irrigation units reached the limit";
			plant.settling = false; //let the plant settle.
			console.log('ERROR: plant: %s, moisture %d irrigation units reached the limit # %d !!!', plant.name, plant.moisture[0], plant.refuelCounter);
		} else {
		//debug string//
		if(config.debug) console.log('plant: %s no irrigation, moisture %d settling %d sensorStarted %d refuelCounter %d irrigate %b', plant.name, plant.moisture[0], plant.settling, sensorStartingUp, plant.refuelCounter, config.irrigate);
				
		}
	} else {
		//debug string//
		if(config.debug) console.log('plant: %s status, moisture %d settling %d sensorStarted %d refuelCounter %d irrigate %b', plant.name, plant.moisture[0], plant.settling, sensorStartingUp, plant.refuelCounter, config.irrigate);
	}
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

		/*if(!config.useSim)*/ plant.pump.On(); //turn on plant
		/*if(!config.useSim)*/ setTimeout(plant.pump.Off, (plant.unit * units));//turn it off later
		if(config.useSim) {
			plant.moisture[0] +=(20 * units);
		}
	}

	//console.log("plant new moisture %d \n", plant.moisture[0]);
}

function settled(plant){
	console.log("ground should be settled! \n");
	plant.settling = false; ///allow irrigating
}


