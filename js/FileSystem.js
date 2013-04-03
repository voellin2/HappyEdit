/**
 * System to read and write files from a remote server.
 */
function FileSystem(eventSystem, settings) {
    var self = this;
    self.fileTree = {};
    self.PROTOCOL_VERSION = "0.1";
    self.authToken = null;

    self.loadFiles = function(host) {
        var xhr = new XMLHttpRequest();
        var url = host + '/files?token=' + settings.get('authToken');
    
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
     */
    self.write = function(buffer, filename) {
        filename = filename || buffer.filename;

        if (!filename) {
            throw "No filename given";
        }

        var xhr = new XMLHttpRequest();
        var url = settings.get('remoteServer') + '/files/' + encodeURIComponent(filename) + '?token=' + settings.get('authToken');
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
        var url = settings.get('remoteServer') + '/files/' + filename + '?token=' + settings.get('authToken');
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
            settings.set('authToken', json.authToken);
            settings.set('remoteServer', host);
            settings.save();
            self.load();
            callback();
        };

        xhr.onerror = function()  {
            callback(xhr.responseText || 'Unknown error');
        };

        xhr.send(params);
    };

    self.disconnect = function() {
        var host = settings.get('remoteServer');
        settings.set('authToken', null);
        settings.set('remoteServer', null);
        settings.save();
        eventSystem.callEventListeners('disconnected');
    };

    self.grep = function(q, callback) {
        var host = settings.get('remoteServer');
        var authToken  = settings.get('authToken');
        var xhr = new XMLHttpRequest();
        var url = host + '/grep?q=' + q + '&token=' + authToken;

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

    /**
     * Called when server settings is configured.
     */
    self.load = function() {
        var remoteServer = settings.get('remoteServer');
        var authToken  = settings.get('authToken');

        console.log(remoteServer, authToken);

        if (!remoteServer || !authToken) {
            console.log('No remote server configured');
            return;
        }
        
        var host = remoteServer;
        var xhr = new XMLHttpRequest();
        var url = host + '/info?token=' + authToken;

        xhr.open("GET", url);

        xhr.onload = function() {
            if (xhr.status !== 200) {
                console.log('Error:', xhr.responseText);
            }
            
            var json = JSON.parse(xhr.responseText);

            if (json.PROTOCOL_VERSION != self.PROTOCOL_VERSION) {
                throw "Protocol version mismatch";
            }
            
            eventSystem.callEventListeners('connected', host);
            
            self.loadFiles(host);
        };

        xhr.onerror = function() {
            throw 'Problem connecting to ' + host;
        };

        xhr.send();
    };
}
