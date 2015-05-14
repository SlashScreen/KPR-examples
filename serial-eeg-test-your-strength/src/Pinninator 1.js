//@module
exports.pins = {
	out:{type:"Digital", direction:"out"}
}
exports.configure=function(parameters){
	this.out.init();
}
exports.close=function(){
	this.out.close();
}
exports.brenda = function(parameters){
	var duration = parameters.duration
	out.write(1);
	sensorUtils.mdelay(duration);
	out.write(0)
}