var config = {};
config.plants = [];
config.useSim = false;
config.irrigate = true;
config.debug = false;
config.interval = 900000; //ms for a normal loop
config.intervalSim = 60000; //one minute for simulation

plant0 = {
	name : "Kawa",
	temperature : [0,10,32], // |actual|min|max|
	fertility : [0,350,2000],
	sunlight : [0,2000,4000],
	moisture : [0,15,40],//used as irrigation limit
	battery : [0,100],
	lastWarning : "",
	mac : 'C4:7C:8D:65:F8:FB', //mac address
	settling : false, // |true|false //start false
	gpio : 14, //gpio number for pump
	pump: null, //placeholder for gpio
	unit : 20000, //ms in order to deliver 25cl
	maxUnits : 7, //max value to irrigate
	refuelCounter : 0 //counter used to check max refuel
};

//plant0 = {
//	name : "Fikus",
//	temperature : [0,10,32], // |actual|min|max|
//	fertility : [0,350,2000],
//	sunlight : [0,2000,4000],
//	moisture : [0,10,50], ///used as irrigation limit
//	battery : [0,100],
//	lastWarning : "",
//	mac : 'C4:7C:8D:65:FB:29', //mac address
//	settling : true, // |true|false
//	gpio : 18, //gpio number for pump
//	pump: null, //placeholder for GPIO
//	unit : 2000 //ms in order to deliver 25cl
//};




config.plants.push(plant0);

/*
config.plants[1].name = "Fikus";
config.plants[1].temperature = [0,18]; // |actual|min|
config.plants[1].fertility = [0,300];
config.plants[1].sunlight = [0,1000];
config.plants[1].moisture = [0,15];
config.plants[1].battery = [0,10];
config.plants[1].lastWarning = "";
config.plants[1].mac = 'C4:7C:8D:65:FB:FB'; //mac address
*/

module.exports = config;
