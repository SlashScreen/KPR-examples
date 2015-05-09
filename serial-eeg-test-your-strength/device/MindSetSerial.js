//@module
/**************************************************************************************
Mindset Serial BLL for Kinoma Create
(c) 2015 Marvell Semiconductor, Inc.

This BLL works with EEG headsets powered by the Neurosky Mindset chip, 
including the MindFlex and the Star Wars® Force Trainer™, when modified 
to connect the T pin (and R pin) and ground from the headset to the 
serial connections on the Kinoma Create.

It exports one function, read() that is meant to be called from a repeat
in the main program with timer=eeg as a query parameter instead of an interval, i.e.:

msg = new MessageWithObject("pins:/sensor/read?repeat=on&timer=eeg&callback=/gotData")

It will capture the packet, parse it into a JSON object and return it as the 
requestObject property of the message to the callback function in the main program.

Based on mindset_communications_protocol.pdf (6/28/2010) from the Neurosky Mindset SDK.
***************************************************************************************/
var SYNC_BYTE=0xAA; // decimal 170, there are two preceding each packet
var MAX_PAYLOAD_LENGTH = 169

exports.pins = {
	eeg:{type:"Serial", baud:9600}
}

exports.configure = function() {
	trace("Initializing headset input...\n");
	this.eeg.init();
	this.eegPowerLength = 0; 
	this.lastByte = null
	return 
}

exports.read = function() {
	var chunk = this.eeg.read("chunk");
	if(chunk.length==0) return {}; // only needed when using intervals instead of timers in main
	var buffer = {
		checksum:0,
		data:new Array(chunk.length),
		payloadLength:0,
		resultData: {},
	};
	// Need some array methods not available with chunks
	for(var u = 0; u < chunk.length; u++) buffer.data[u] = chunk[u]; 

	if (buffer.data.length < 8) return {error: "Partial Packet!"}; 
	// if chunk doesn't start with two sync bytes, it's a bad packet
	if(hasSyncBytes(buffer)) {
		buffer.data.splice(0,2) // discard sync bytes
	} else {
		return {error:"Bad sync sequence!"};
	}
	
	// First byte should now be length byte, and be less than MAX_PAYLOAD_LENGTH
	if(hasLengthByte(buffer)) {
		buffer.payloadLength = buffer.data.shift();
	} else {
		return {error:"Invalid length byte!"};
	}
		
	buffer.checksum = buffer.data.pop(); //checksum is last byte
	
	if(buffer.payloadLength != buffer.data.length) {
		trace ("Bad packet: Says length is " + buffer.payloadLength + " but appears to actually be " + buffer.data.length + ".\n");
		return {error:"Buffer size mismatch!"};
	} else {
		buffer.payload = buffer.data
	}

	if(checksumMatches(buffer.checksum, buffer.data)) {
		buffer.resultData = parsePayload(buffer);
		return buffer.resultData;
	} else {
		return {error:"Checksum failed!"}
	}
}

var hasSyncBytes = function(packet) {
	if(packet.data[0] == SYNC_BYTE && packet.data[1] == SYNC_BYTE) { 
		return true;
	} else { 
		return false
	}
}

var hasLengthByte = function(packet) {
	var lengthByte = packet.data[0];
	var packetLength = packet.data.length-2 // not considering length or checksum bytes
	if(lengthByte == 0) {
    	trace("Bad packet: Says length is " + lengthByte + ".\n");
        return false;
    }

    if(lengthByte > MAX_PAYLOAD_LENGTH) {
    	trace("Payload too long: " + lengthByte + "! (maximum " + MAX_PAYLOAD_LENGTH + ")\n");
        return false;
    }

    if(lengthByte > packetLength) {
    	trace("Payload too long or packet truncated; says it is" + lengthByte + " bytes, but payload length is " + packetLength + " bytes.\n");
        return false;
    }
        
	return true;
} 

var numOfSyncBytes = function(chunk) {
	var syncByteCount = 0;
	for( var c = 0; c < chunk.length; c++) {
		if(chunk[c] == SYNC_BYTE) syncByteCount++;
	}
	return syncByteCount;
}

var checksumMatches = function(checksum, data) {
	var sum = 0;
	for( var c = 0; c < data.length; c++) {
		sum += data[c];
	}
	// Checksum byte is 1's complement of least significant byte of sum of all payload packets
	sum = 255 - (sum % 256);
	if (sum == checksum) {
		return true;
	} else {
		// Checksum mismatch, send an error.
		debugger;
		trace("ERROR: Checksum does not match, was " + sum + ", expected " + checksum + ".\n");
		return false;
	}
}
	
var parsePayload = function(buffer) {
	var payload = buffer.data;
	var result = {
		error:null,
		signalQuality:200,
		attention:0,
		meditation:0
	};
	var payloadLength = buffer.payloadLength;
	var parseSuccess = true
	var excodeLevel = 0;
	// Loop through the packet, extracting data.

	for (var i = 0; i < payloadLength; i++) {
		switch (payload[i]) {
			case 0x2:
				result.signalQuality = payload[++i];
				break;
			case 0x4:
				result.attention = payload[++i];
				break;
			case 0x5:
				result.meditation = payload[++i];
				break;
			case 0x83: 
					// Force Trainer only has this in first packet after powerup
					/*
					// Next byte is the length
					if(payload[++i] != 24) {
						result.error = "EEG band power data should be 24 bytes, but is " + payload[i] + "bytes.";
						break;
					}
					// Eight sets of three bytes for the values. Documentation is contradictory but
					// data appears to be big-endian
					result.delta = 		(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.theta = 		(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.lowAlpha = 	(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.highAlpha = 	(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.lowBeta = 	(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.highBeta = 	(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.lowGamma = 	(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					result.midGamma = 	(payload[++i] << 16) | (payload[++i] << 8) | payload[++i];
					*/
				break;
			case 0x80:
				// Raw wave power.  From the docs: 
				// "a single big -endian 16 -bit two's-compliment signed value (high -order byte followed by low -order byte) (-32768 to 32767)"
				result.rawPower = (payload[++i] << 8) | payload[++i];
				break;
			case 0x55:
				//Extended codes
				while(payload[i] == 0x55) {
					excodeLevel++
					i++
                }
				trace("Extended code 0x" + payload[i].toString(16) + " not currently supported, skipping over data.\n");
                if(payload[i] < 0x80) { //single byte code
                	i++
                } else { // multibyte code, next byte is length
                	for (var s = 0; s<payload[++i]; s++) {
                		i++
                	}
                }
				break;
			default:
				trace("Unknown code 0x" + payload[i].toString(16) + " in position " + i + ".\n");
				parseSuccess = false;
				break;
		}
	}
		return (parseSuccess) ? result: {error:"Parse failed!"};
}

exports.close = function(parameters) {
	trace("\n")
	this.eeg.close()
}
