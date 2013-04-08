function GrepWorker(fileSystem) {
    var self = this;
    self.hasReceivedStopSignal = false;
    
    self.stop = function() {
        self.hasReceivedStopSignal = true;
    };
    
    /**
     * Searches all files in the FileSystem for the query string passed in.
     * When a match is found, the passed in callback is called. As more matches
     * are found, the callback is called repeatadly.
     */
    self.findInAllFiles = function(q, matchFoundCallback) {
        var files = fileSystem.getFlatList();
        console.log('flatlist', files);
        self.searchNextFile(files, q, matchFoundCallback);
    };
    
    self.searchNextFile = function(files, q, matchFoundCallback) {
        if (files.length === 0 || self.hasReceivedStopSignal) {
            return;
        }
        
        var filename = files.pop();
        
        self.searchFile(filename, q, function(filename, lineNumber, snippet) {
            if (lineNumber !== -1) {
                matchFoundCallback(filename, lineNumber, snippet);
            }
            
            self.searchNextFile(files, q, matchFoundCallback);
        });
    };
    
    /**
     * Fetches and searches the passed in file. Returns -1 if no match was
     * found.
     * 
     * TODO: implement more bulletproof method than the current splitting on
     * newline character.
     */
    self.searchFile = function(filename, q, callback) {
        console.log('searching', filename);
        fileSystem.getFile(filename, function(body) {
            var rows = body.split('\n');
            rows.forEach(function(row, i) {
                var lineNumber = -1;
                var snippet = null;
                
                if (row.indexOf(q) !== -1) {
                    lineNumber = i+1;
                    snippet = row;
                }
                
                callback(filename, lineNumber, snippet);
            });
        });
    };
}

function testGrepWorker() {
    var worker = new GrepWorker(happyEdit.fileSystem);
    var q = 'test';
    worker.findInAllFiles(q, function(filename, lineNumber, snippet) {
        console.log('matchFoundCallback', lineNumber, snippet);
    });
}