var fs = require('fs')
	, file
	, byte_size = 256
	, readbytes = 0
	, lastLineFeed
	, lineArray
	, continueReading = true; // Make the decision to continue reading or not


fs.open('test-read-write.txt', 'r', function(err, fd){
	 file=fd; readsome(); });

function processsome(err, bytecount, buff) {
	
    lastLineFeed = buff.toString('utf-8', 0, bytecount).lastIndexOf('\n');

    if (lastLineFeed > -1){

        // Split the buffer by line
        lineArray = buff.toString('utf-8', 0, bytecount).slice(0,lastLineFeed).split('\n');
		
		// Find each line and print them out
		for (var i = 0; i< lineArray.length; i++) {
			console.log("This is a line: " + lineArray[i]); 
			if (lineArray[i] === "Done") {
				continueReading = false;
			}
		}  

        // Set a new position to read from
        readbytes+=lastLineFeed+1;
		
    } else {
        // No complete lines were read
        readbytes+=bytecount;
    }
	
	if (continueReading) {
		readsome();
	}
}

function readsome() {

	var stats = fs.fstatSync(file);
	
	if (stats.size < readbytes + 1) {
        console.log('Hehe I am much faster than your writer..! I will sleep for a while, I deserve it!');
        setTimeout(readsome, 3000);		
	} else {
		
		fs.read(file, new Buffer(byte_size), 0, byte_size, readbytes, processsome);
		
	}


}
