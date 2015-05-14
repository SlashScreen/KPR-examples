//@module

var PinsSimulators = require('PinsSimulators');

var qualitySlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Signal Degradation", 
	valueID : "signalQuality", 
	speed : 0.5, 
	minValue:0, 
	maxValue:200, 
	value:45, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var attentionSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Attention",
	valueID : "attention",
	speed : 0.5,
	minValue:0,
	maxValue:100,
	value:0, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var meditationSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Meditation",
	valueID : "meditation",
	speed : 0.5,
	minValue:0,
	maxValue:100,
	value:0, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})
/*
var deltaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Delta",
	valueID : "delta",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var thetaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Theta",
	valueID : "theta",
	speed : 0.5,
	minValue:0,
	maxValue: 0xFFFFFF,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var lowAlphaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Low Alpha",
	valueID : "lowAlpha",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var highAlphaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "High Alpha",
	valueID : "highAlpha",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var lowBetaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Low Beta",
	valueID : "lowBeta",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var highBetaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "High Beta",
	valueID : "highBeta",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var lowGammaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Low Gamma",
	valueID : "lowGamma",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})

var midGammaSlider = new PinsSimulators.AnalogInputAxisDescription({
	valueLabel : "Mid-Gamma",
	valueID : "midGamma",
	speed : 0.5,
	minValue:0,
	maxValue: 16777216,
	value:200, 
	dataType:"float", 
	defaultControl:PinsSimulators.SLIDER
})
*/
exports.configure = function(configuration) {
	this.pinsSimulator = shell.delegate("addSimulatorPart", {
		header : {
			label : "EEG Values", 
			name : "EEG Headset", 
			iconVariant : PinsSimulators.SENSOR_SLIDER
      	},
		axes : [
			qualitySlider, 
			attentionSlider,
			meditationSlider,
			//deltaSlider,
			//thetaSlider,
			//lowAlphaSlider,
			//highAlphaSlider,
			//lowBetaSlider,
			//highBetaSlider,
			//lowGammaSlider,
			//midGammaSlider,
		]
	});
}

exports.close = function() {
  shell.delegate("removeSimulatorPart", this.pinsSimulator);
}

exports.read = function() {
  return this.pinsSimulator.delegate("getValue");
}

exports.pins = {
  eeg: { type: "Serial", baud:9600 }
};