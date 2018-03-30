var config = {};
config.plants = [];
config.useSim = true;//false;

plant0 = {
	name : "Kawa",
	temperature : [0,10,32], // |actual|min|max|
	fertility : [0,350,2000],
	sunlight : [0,2000,4000],
	moisture : [0,10,50],//used as irrigation limit
	battery : [0,100],
	lastWarning : "",
	mac : 'C4:7C:8D:65:F8:FB', //mac address
	stabilizing : false, // |true|false
	gpio : 10, //gpio number for pump
	pump: null, //placeholder for gpio
	unit : 2000 //ms in order to deliver 25cl
};

plant1 = {
	name : "Fikus",
	temperature : [0,10,32], // |actual|min|max|
	fertility : [0,350,2000],
	sunlight : [0,2000,4000],
	moisture : [0,10,50], ///used as irrigation limit
	battery : [0,100],
	lastWarning : "",
	mac : 'C4:7C:8D:65:FB:FB', //mac address
	stabilizing : false, // |true|false
	gpio : 11, //gpio number for pump
	pump: null, //placeholder for GPIO
	unit : 2000 //ms in order to deliver 25cl
};

config.plants.push(plant0);

config.plants.push(plant1);
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
