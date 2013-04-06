/**
 * System to read and write files from a remote server.
 */
function FileSystem(eventSystem) {
    var self = this;
    self.fileTree = {};
    self.PROTOCOL_VERSION = "0.1";
    self.authToken = null;
    self.host = null;

    self.loadFiles = function(host, authToken) {
        var xhr = new XMLHttpRequest();
        var url = host + '/files?token=' + authToken;
        
        self.host = host;
        self.authToken = authToken;
    
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
    self.write = function(buffer, filename) {
        filename = filename || buffer.filename;

        if (!filename) {
            throw "No filename given";
        }

        var xhr = new XMLHttpRequest();
        var url = self.host + '/files/' + encodeURIComponent(filename) + '?token=' + self.authToken;
        var params = 'body=' + encodeURIComponent(buffer.getBody());

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        document.querySelector('#notification').style.visibility = 'visible';

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                document.querySelector('#notification').style.visibility = 'hidden';
                console.log(xhr.responseText);

                if (!buffer.filename) {
                    buffer.rename(filename);
                }
            }
        };

        xhr.send(params);
    };

    self.getFile = function(filename, callback) {
        var xhr = new XMLHttpRequest();
        var url = self.host + '/files/' + filename + '?token=' + self.authToken;
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

    self.connect = function(args, callback) {
        args = args.split(' ');

        var host = args[0];
        var password = args[1];

        if (!host || !password) {
            throw "Host or password missing";
        }

        if (host.split(':')[0] !== 'http') {
            host = 'http://' + host;
        }

        var xhr = new XMLHttpRequest();
        var url = host + '/connect';
        var params = 'password=' + encodeURIComponent(password);

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            if (xhr.status !== 200) {
                callback(xhr.responseText || 'Unknown error');
                return;
            }
            
            var json = JSON.parse(xhr.responseText);
            
            eventSystem.callEventListeners('connected', {
                host: host,
                authToken: json.authToken
            });
            
            self.loadFiles(host, json.authToken);
            callback();
        };

        xhr.onerror = function()  {
            callback(xhr.responseText || 'Unknown error');
        };

        xhr.send(params);
    };

    self.grep = function(q, callback) {
        var xhr = new XMLHttpRequest();
        var url = host + '/grep?q=' + q + '&token=' + self.authToken;

        xhr.open("GET", url);

        xhr.onload = function() {
            if (xhr.status !== 200) {
                console.log('Error:', xhr.responseText);
                return;
            }
            var json = JSON.parse(xhr.responseText);
            callback(json);
        };

        xhr.onerror = function() {
            console.log('Unknown error while grepping');
        };

        xhr.send();
    };
}
