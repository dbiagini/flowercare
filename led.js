'use strict';
module.exports = class LED{
	constructor(gpio_pin){
		this.pin = new gpio(4, 'out');
		this.pin.writeSync(0); //initialize to off
		this.blinkInterval = null;

	}

	Toggle(){
		if(this.pin)
		{
			/*var stat = statusLED.readSync();
			console.log("status LED %d \n", stat);
			if(stat == 0){
				statusLED.writeSync(1);
			}
			else{
				statusLED.writeSync(0);
			}*/
			this.pin.writeSync(this.pin.readSync() === 0 ? 1:0);
		} else console.log("status LED not working \n");
	}

	On(){
		if(this.pin)
		{
			this.pin.writeSync(1);
		} else console.log("status LED not working \n");
	}

	Off(){
		if(this.pin)
		{
			this.pin.writeSync(0);
		} else console.log("status LED not working \n");
	}

	Blink(){
		if(this.pin)
		{
			if(this.blinkInterval == null) this.blinkInterval = setInterval(this.lToggle, 500);
			else console.log("blinking interval is already set");
		} else console.log("status LED not working \n");
	}

	endBlink(){
		if(this.blinkInterval)
		{
			clearInterval(this.blinkInterval);
			this.pin.writeSync(1);
			this.blinkInterval = null;
		} else console.log("status LED not working \n");
	}


}
