/**
 * System to read and write files from a remote server.
 */
function FileSystem(eventSystem, notifications) {
    var self = this;
    self.fileTree = {};
    self.PROTOCOL_VERSION = "0.1";
    self.server = null;
    self.project = null;
    
    eventSystem.addEventListener('project_switched', function(project) {
        self.project = project;
        self.loadFiles();
    });
    
    eventSystem.addEventListener('connected', function(server) {
        self.server = server;
    });
    
    self.getFlatList = function() {
        var ret = [];
        var key;
        
        for (key in self.fileTree) {
            if (!self.fileTree.hasOwnProperty(key)) {
                return;
            }
            
            self.fileTree[key].files.forEach(function(filename) {
                var dirname = key;
                
                if (dirname !== '.') {
                    dirname = './' + dirname;
                }
                
                ret.push(dirname + '/' + filename);
            });
        }
        
        return ret;
    };

    self.loadFiles = function() {
        var project = self.project;
        var server = self.server;
        
        var xhr = new XMLHttpRequest();
        var url = server.host + '/' + project.id + '/files?token=' + server.authToken;
        
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.responseText) {
                    var json = JSON.parse(xhr.responseText);
                    self.fileTree = json;
                    eventSystem.callEventListeners('filesystem_loaded');
                }
            }
        };
        
        xhr.send();
    };
    
    /**
     * Write a buffer to the remote server.
     * 
     * A filename can be specified in addition to the buffer so that the file
     * can be saved to another destination file.
     */
    self.write = function(buffer, filename, callback) {
        filename = filename || buffer.filename;

        if (!filename) {
            throw "No filename given";
        }
        
        var project = self.project;
        var server = self.server;

        var xhr = new XMLHttpRequest();
        var url = server.host + '/' + project.id + '/files/' + encodeURIComponent(filename) + '?token=' + server.authToken;
        var params = Utils.createPostParams({
            body: buffer.getBody()
        });

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        notifications.show('Saving...');
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                notifications.hide();
                console.log(xhr.responseText);

                if (!buffer.filename) {
                    buffer.rename(filename);
                }
                
                if (callback) {
                    callback();
                }
            }
        };

        xhr.send(params);
    };
    
    self.deleteFile = function(filename, callback) {
        if (!filename) {
            throw "No filename given";
        }
        
        var project = self.project;
        var server = self.server;

        var xhr = new XMLHttpRequest();
        var url = server.host + '/' + project.id + '/files/' + encodeURIComponent(filename) + '?token=' + server.authToken;

        xhr.open("DELETE", url);

        notifications.show('Deleting...');

        xhr.onload = function() {
            notifications.hide();
            console.log(xhr.responseText);
        };
        
        xhr.onerror = function() {
            notifications.hide();
            console.log(xhr.responseText);
        };

        xhr.send();
    };

    self.getFile = function(filename, callback) {
        var project = self.project;
        var server = self.server;
        
        var xhr = new XMLHttpRequest();
        var url = server.host + '/' + project.id + '/files/' + filename + '?token=' + server.authToken;
        xhr.open("GET", url);
        xhr.onload = function() {
            body = xhr.responseText;
            callback(body);
            eventSystem.callEventListeners('file_loaded', {
                filename: filename,
                body: body
            });
        };
        xhr.send();
    };
}
