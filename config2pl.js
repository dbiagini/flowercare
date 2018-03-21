var config = {};
config.plants = [];
config.useSim = true;//false;

plant0 = {
	name : "Kawa",
	temperature : [0,20], // |actual|min|
	fertility : [0,300],
	sunlight : [0,1000],
	moisture : [0,150],
	battery : [0,100],
	lastWarning : "",
	mac : 'C4:7C:8D:65:F8:FB', //mac address
};

plant1 = {
	name : "Fikus",
	temperature : [0,20], // |actual|min|
	fertility : [0,300],
	sunlight : [0,1000],
	moisture : [0,150],
	battery : [0,100],
	lastWarning : "",
	mac : 'C4:7C:8D:65:FB:FB', //mac address
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
