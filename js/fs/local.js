function FileSystem(eventSystem, settings) {
    var self = this;
    self.HOST = 'localStorage';
    self.KEY = 'happyedit_filesystem';
    self.fileTree = {};
    self.fs = {};
    
    self.write = function(buffer, filename) {
        filename = filename || buffer.filename;
        
        if (!Utils.startsWith(filename, './')) {
            filename = './' + filename;
        }

        if (!filename) {
            throw "No filename given";
        }
        
        self.addToFileTree(filename);
        self.fs[filename] = buffer.getBody();
        
        Storage.set(self.KEY, self.fs, function() {
            buffer.session.getUndoManager().reset(); // TODO ... why?
            document.querySelector('#notification').style.visibility = 'hidden'; // TODO move to event listener
            
            if (!buffer.filename) {
                buffer.rename(filename);
            }
        });
    };

    self.getFile = function(filename, callback) {
        var body = self.fs[filename];
        eventSystem.callEventListeners('file_loaded', {
            filename: filename,
            body: body
        });
        callback(body);
    };

    self.connect = function(args, callback) {
        callback();
    };

    self.disconnect = function() {
        eventSystem.callEventListeners('disconnected', self.HOST);
    };
    
    self.addToFileTree = function(filename) {
        var split = filename.split('/');
        var basename = split.length > 1 ? split.pop() : null;
        var dirname = split.join('/');

        if (!self.fileTree.hasOwnProperty(dirname)) {
            self.fileTree[dirname] = {
                files: [],
                directories: [],
            };
        }
        
        if (basename) {
            self.fileTree[dirname].files.push(basename);
        }
    };
    
    self._buildFileTree = function() {
        self.fileTree = {};
        var key;
        
        for (key in self.fs) {
            if (self.fs.hasOwnProperty(key)) {
                self.addToFileTree(key);
            }
        }
        
        if (!self.fs.hasOwnProperty('.')) {
            self.addToFileTree('.');
        }
    };

    self.load = function() {
        Storage.get(self.KEY, {}, function(data) {
            self.fs = data;
            self._buildFileTree();
            eventSystem.callEventListeners('connected', self.HOST);
            eventSystem.callEventListeners('filesystem_loaded');
        });
    };
}
