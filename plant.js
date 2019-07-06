var PythonShell = require('python-shell');
var Pump = require('./pump.js');

module.exports = class Plant {

	/*constructor() {
		//initialize plant internal variables
		this.name = "";
		this.temperature = [0,0,0];// vector |actual|min|max|
		this.fertility = [0,0,0]; //vector |actual|min|max|
		this.sunlight = [0,0,0]; //vectpr |actual|min|max|
		this.moisture = 0; ///used as irrigation limit
		this.battery = 0; //battery  status
		this.lastWarning = ''; //sensor issues log
		this.mac = 0; //mac address
		this.settling = false; // |true|false
		this.gpio = 0; //gpio pin number for pump
		this.pump = null; //placeholder for GPIO instance
		this.unit = 0; //ms pump opening in order to deliver 25cl
		this.maxUnits = 0; //max value to irrigate
		this.refuelCounter = 0 //counter used to check max refuel
	}*/
	constructor(plant) {
		//initialize plant internal variables
		this.name = plant.name;
		this.temperature = plant.temperature;// vector |actual|min|max|
		this.fertility = plant.fertility; //vector |actual|min|max|
		this.sunlight = plant.sunlight; //vectpr |actual|min|max|
		this.moisture = plant.moisture; ///used as irrigation limit
		this.battery = plant.battery; //battery  status
		this.lastWarning = ''; //sensor issues log
		this.mac = plant.mac; //mac address
		this.settling = false; // |true|false
		this.gpio = plant.gpio; //gpio pin number for pump
		this.pump = null; //placeholder for GPIO instance
		this.unit = plant.unit; //ms pump opening in order to deliver 25cl
		this.maxUnits = plant.maxUnits; //max value to irrigate
		this.refuelCounter = 0 //counter used to check max refuel
		this.options = ''; //placeholder for sensor driver
	}

	initPump(){
	
		if(this.gpio != 0){
			this.pump = new Pump(this.gpio);
		}
	}

	initPlant(plant){
		//initialize plant internal variables
		if(plant.name) this.name = plant.name;
		if(plant.temperature) this.temperature = plant.temperature;// vector |actual|min|max|
		if(plant.fertility) this.fertility = plant.fertility; //vector |actual|min|max|
		if(plant.sunlight) this.sunlight = plant.sunlight; //vectpr |actual|min|max|
		if(plant.moisture) this.moisture = plant.moisture; ///used as irrigation limit
		if(plant.battery) this.battery = plant.battery; //battery  status
		this.lastWarning = ''; //sensor issues log
		if(plant.mac) this.mac = plant.mac; //mac address
		this.settling = false; // |true|false
		this.pump = null; //placeholder for GPIO instance
		if(plant.unit) this.unit = plant.unit; //ms pump opening in order to deliver 25cl
		if(plant.maxUnits) this.maxUnits = plant.maxUnits; //max value to irrigate
		this.refuelCounter = 0 //counter used to check max refuel

	
		if(plant.gpio != 0){
			this.gpio = plant.gpio;
			this.pump = new Pump(plant.gpio);
		}
	}

	initSensor(options){
		this.options = options; //copy the option params locally 
	}

	initSimulation(){
		this.temperature[0] = this.temperature[1];
		this.fertility[0] = this.fertility[1];
		this.sunlight[0] = this.sunlight[1];
		this.moisture[0] = this.moisture[1]+20;
		this.battery[0] = this.battery[1];
	
	}
	refuelPlant(){

		///
		this.settling = true;
		var diff = this.moisture[2] - this.moisture[0];
		var units = Math.abs(Math.ceil(diff/20));//one unit is 25cl, increase ~20%  assuming linear model, simplistic
		if(units >= this.maxUnits) units=this.maxUnits; //limitate max irrigation
		this.refuelCounter+= units;//increment limit counter
		console.log("refueling %d units \n", units);
		///irrigate n units
		if(this.pump){

			/*if(!config.useSim)*/ this.pump.On(); //turn on plant
			/*if(!config.useSim)*/ setTimeout(this.pump.Off, (this.unit * units));//turn it off later
			if(config.useSim) {
				this.moisture[0] +=(20 * units);
			}
		}

		//console.log("plant new moisture %d \n", plant.moisture[0]);
	}

	settled(){
		console.log("ground should be settled! \n");
		this.settling = false; ///allow irrigating
	}

	checkIrrigate(){
	///after updating the status compare the water level and kick the refueling // plant settling is set true during the first irrigation and turned of when the 
		if ((((this.moisture[0] <= this.moisture[1]) && (!this.settling)) || ((this.moisture[0] > this.moisture[1]) && (this.moisture[0] < this.moisture[2]) && (this.settling))) && (this.refuelCounter <= this.maxUnits)){

			console.log('plant: %s needs refueling, moisture %d settling %d ', this.name, this.moisture[0], this.settling);
			refuelPlant();
		} else if ((this.moisture[0] >= this.moisture[2]) && (this.settling)) {
			this.settling = false; //finished refueling.
			this.refuelCounter = 0;//reset limit counter
			console.log('plant: %s finished refueling, moisture %d settling %d ', this.name, this.moisture[0], this.settling);
		} else if ((this.moisture[0] <= this.moisture[1]) && (this.settling)){
		  ///something is wrong the refueling happened and it's not having effects
			
			this.updateLastWarning(" ERROR refueling failed or Sensor not responding");
			//var d = new Date();
			//this.lastWarning = d.toUTCString() + " ERROR refueling failed or Sensor not responding";
			console.log('ERROR: plant: %s, moisture %d refueling or Sensor not working!!!', this.name, this.moisture[0]);

		} else if (this.refuelCounter > this.maxUnits){
			
			this.updateLastWarning(" ERROR irrigation units reached the limit");

			//var d = new Date();
			//plant.lastWarning = d.toUTCString() + " ERROR irrigation units reached the limit";
			this.settling = false; //let the plant settle.
			console.log('ERROR: plant: %s, moisture %d irrigation units reached the limit # %d !!!', this.name, this.moisture[0], this.refuelCounter);
		} else {
		//debug string//
			this.logStatus();
				
		}
		
	}

	updateLastWarning(err){
		var d = new Date();
		this.lastWarning = d.toUTCString() + err;

	}

	updateStatus(input){
	
		if(input){
			this.temperature[0] = input[0];
			this.moisture[0] = input[1];
			this.sunlight[0] = input[2];
			this.fertility[0] = input[3];
			this.battery[0] = input[4];

		} else {
		   console.log("empty input vector UpdateStatus");
		}
	}

	logStatus(){
		console.log('plant: %s status, moisture %d settling %d refuelCounter %d ', this.name, this.moisture[0], this.settling, this.refuelCounter);
	}

	checkStatus(useSim, irrigate){
		if (!useSim){

			options.args = this.mac;//only input variable
				PythonShell.run('demo.py', options, function (err,data){
				this.handlePostcheck(err, data, irrigate);
			});

		} else {

			//this runs only if the sensor simulation is being used
			//output="Temperature="+temperature.toString()+" Moisture="+moisture.toString()+" Sunlight= "+sunlight.toString()+" Fertility="+fertility.toString();
				//plant.temperature[0] -= Math.floor(Math.random() * 5);
				//plant.fertility[0] -= Math.floor(Math.random() * 5);
				//plant.sunlight[0] -= Math.floor(Math.random() * 5);
				this.moisture[0] -= Math.floor(Math.random() * 10);
				//plant.battery[0]  -= Math.floor(Math.random()* 5);
				console.log('plant: %s, sim moisture %d ', this.name, this.moisture[0]);
			if(irrigate) {
				this.checkIrrigate();
			} else {
				//debug string//

				this.logStatus();
			}

		}

	}

	handlePostcheck(err, output, irrigate){

		if(err){
			//handle errors from Python
			//Don't change Values
			//should print a warning in the page
			this.updateLastWarning("Issue with connection to the sensor");
		} else {

			this.updateStatus(output);		
		}
		//log in any case
		console.log('output: %j', output);

		if(irrigate) { //irrigate can be turned off by config or by the sensorIsStarting flag
		
			this.checkIrrigate();

		} else {
			//debug string//
			plant.logStatus();
			console.log(' sensorStarted %d irrigate %b', sensorStartingUp, config.irrigate);
		}


	}


}
