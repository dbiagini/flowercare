'use strict';
module.exports = class Pump {

	constructor(gpio_nr){
		this.pin = new gpio(gpio_nr, 'out');
		this.pin.writeSync(0); //initialize to 0 the pin;

	}

	toggle(){
		if(this.pin)
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

			this.pin.writeSync(this.pin.readSync() === 0 ? 1:0);
		} else console.log("Error Pump.Toggle \n");
	}

	On(){
		if(this.pin)
		{
			this.pin.writeSync(1);
			console.log("Pump on \n");

		} else console.log("Error Pump.On \n");
	}

	Off(){
		if(this.pin)
		{
			this.pin.writeSync(0);
			console.log("Pump off \n");
		} else console.log("Error Pump.Off \n");
	}


}
