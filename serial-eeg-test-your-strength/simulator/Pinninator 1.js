//@module

var PinsSimulators = require('PinsSimulators');

exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
		header : {
			label : "Gumball Dispenser", 
			name : "Dispenser Tube Solenoid", 
			iconVariant : PinsSimulators.SENSOR_LED
      	},
		axes : [
			new PinsSimulators.DigitalOutputAxisDescription({
				valueLabel : "Solenoid", 
				valueID : "bellRing", 
			})
		]
	});
}

exports.close = function() {
  shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.brenda = function(parameters) {
  this.setValue(1);
  sensorUtils.mdelay(parameters.duration)
  this.setValue(0)
}

exports.pins = {
  out: { type: "Digital", direction:"output" }
};