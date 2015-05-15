//@module
exports.pins = {
	out:{type:"Digital", direction:"output"}
}
exports.configure=function(parameters){
	this.out.init();
}
exports.close=function(){
	this.out.close();
}
exports.brenda = function(parameters){
	var duration = parameters.duration
	this.out.write(1);
	sensorUtils.mdelay(duration);
	this.out.write(0)
}