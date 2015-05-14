//@module
exports.pins = {
	eeg:{type:"Serial", baud:9600}
}

exports.configure = function() {
	this.eeg.init();
}

exports.read = function() {

	// First, read packet as a chunk of serial data
	var chunk = this.eeg.read("chunk");

	// Now, assign buffer's properties to the data and metadata from the packet
	var buffer = {
		checksum:0,
		data:new Array(chunk.length),
		resultData: {},
	};
	
	// Need some array methods not available with chunks
	for(var u = 0; u < chunk.length; u++) buffer.data[u] = chunk[u]; 
	buffer.data.splice(0,2) 					// discard sync bytes
	buffer.payloadLength = buffer.data.shift(); // length is first byte
	buffer.checksum = buffer.data.pop(); 		// checksum is last byte
	buffer.payload = buffer.data 				// what's left is the actual data
	buffer.resultData = parsePayload(buffer);	// parse the data payload
	return buffer.resultData; 
}
	
var parsePayload = function(buffer) {
	var payload = buffer.data;
	var result = {
		error:null,
		signalQuality:200,
		attention:0,
		meditation:0
	};
	var parseSuccess = true

	// Loop through the payload, extracting data.
	// Code bytes are followed by data bytes
	// Multibyte data items are preceded by a length byte
	for (var i = 0; i < buffer.payloadLength; i++) {
		switch (payload[i]) {
			case 0x2: // Really signal degradation from 0 (good) to 200 (no data)
				result.signalQuality = payload[++i];
				break;
			case 0x4: // attention eSense value
				result.attention = payload[++i];
				break;
			case 0x5: // meditation eSense value
				result.meditation = payload[++i];
				break;
			case 0x83: // EEG wave data
					// Force Trainer only has this in first packet after powerup
					i+=25 // length byte, always 24, plus 24 bytes of data we can't use
				break;
			// Omitting codes 0x55 and 0x80, will never see it from Force Trainer
			default:
				trace("Unknown code 0x" + payload[i].toString(16) + " in position " + i + ".\n");
				parseSuccess = false;
				break;
		}
	}
	return (parseSuccess) ? result: {error:"Parse failed!"};
}

exports.close = function(parameters) {
	this.eeg.close()
}