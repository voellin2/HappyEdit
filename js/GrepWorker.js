/**
 * Searches all files in the FileSystem after a passed in query string.
 * 
 * This system is not utilizing web workers right now, but that is the plan.
 */
function GrepWorker(fileSystem) {
    var self = this;
    
    // Variables used to show progress.
    self.count = 0;
    self.nFiles = 0;
    
    self.hasReceivedStopSignal = false;
    
    self.stop = function() {
        self.hasReceivedStopSignal = true;
    };
    
    /**
     * Searches all files in the FileSystem for the query string passed in.
     * When a match is found, the passed in callback is called. As more matches
     * are found, the callback is called repeatadly.
     */
    self.findInAllFiles = function(q, progressCallback, matchFoundCallback) {
        var files = fileSystem.getFlatList();
        self.progressCallback = progressCallback;
        self.matchFoundCallback = matchFoundCallback;
        self.count = 0;
        self.nFiles = files.length;
        self.searchNext(files, q);
    };
    
    self.searchNext = function(files, q) {
        if (files.length === 0 || self.hasReceivedStopSignal) {
            return;
        }
        
        var filename = files.pop();
        
        fileSystem.getFile(filename, function(body) {
            self.progressCallback(filename, ++self.count, self.nFiles);
            self.match(filename, body, q);
            self.searchNext(files, q);
        });
    };
    
    /**
     * TODO: move this job to a web worker.
     */
    self.match = function(filename, body, q) {
        var rows = body.split('\n');
        rows.forEach(function(row, i) {
            var lineNumber = -1;
            var snippet = null;
            
            if (row.indexOf(q) !== -1) {
                lineNumber = i+1;
                snippet = row;
                self.matchFoundCallback(filename, lineNumber, snippet);
            }
        });
    };
}