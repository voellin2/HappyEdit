/**
 * System to read and write files from a remote server.
 */
function RemoteFileSystem(eventSystem, settings) {
    var self = this;
    self.fileTree = {};
    self.files = [];
    self.autoSuggestList = new FilterList();
    self.path = null;
    self.interval = null;
    self.connectionProblem = false;
    self.PROTOCOL_VERSION = "0.1";
    self.authToken = null;

    // Ping remote to make sure we're connected.
    eventSystem.addEventListener('connected', function(host) {
        var pingUrl = host + '/ping';

        self.interval = window.setInterval(function() {
            var xhr = new XMLHttpRequest();
            var url = host + '/ping?token=' + settings.get('authToken');
            xhr.open("GET", url);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (!xhr.responseText && !self.connectionProblem) {
                        self.connectionProblem = true;
                        eventSystem.callEventListeners('disconnected', host);
                    } else if (xhr.responseText && self.connectionProblem) {
                        self.connectionProblem = false;
                        eventSystem.callEventListeners('connected', host);
                    }
                }
            };
            xhr.send();
        }, 5000);
    });
    
    self.setData = function(json) {
        self.fileTree = json;
        self.files = [];

        var key;
        var i;
        var node;
        var file;

        for (key in self.fileTree) {
            if (self.fileTree.hasOwnProperty(key)) {
                node = self.fileTree[key];
                for (i = 0; i < node.files.length; i += 1) {
                    file = node.files[i];
                    self.files.push(key + '/' + file);
                }
            }
        }

        var map = self.files.map(function(filename) {
            return {
                value: filename,
                keys: filename.toLowerCase().split('/')
            };
        });

        self.autoSuggestList.load(map);
    };

    eventSystem.addEventListener('connected', function(host) {
        var xhr = new XMLHttpRequest();
        var url = host + '/files?token=' + settings.get('authToken');

        self.files = [];
        self.autoSuggestList.clear();
    
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.responseText) {
                    var json = JSON.parse(xhr.responseText);
                    self.setData(json);
                }
            }
        };

        xhr.send();
    });

    self.isConnected = function() {
        return !self.connectionProblem;
    };
    
    /**
     * Gets a list of auto completions in the format expected by the
     * CommandLine
     */
    self.getSuggestions = function(q) {
        var suggestions = [];
        var i;
        var split;
        var autoCompletions = this.autoSuggestList.getSuggestions(q);
        var autoCompletion;

        for (i = 0; i < autoCompletions.length; i += 1) {
            autoCompletion = autoCompletions[i];
            split = autoCompletion.split(PATH_SEPARATOR);
            suggestions.push({
                title: split.pop(),
                extra: capFileName(autoCompletion, 60),
                rel: autoCompletion
            });
        }

        return suggestions;
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
        var params = 'body=' + encodeURIComponent(buffer.session.getValue());

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        document.querySelector('#notification').style.visibility = 'visible';

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                document.querySelector('#notification').style.visibility = 'hidden';
                console.log(xhr.responseText);
                buffer.session.getUndoManager().reset();

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
            callback(xhr.responseText);
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
        eventSystem.callEventListeners('disconnected', host);
    };

    /**
     * Called when server settings is configured.
     */
    self.load = function() {
        var remoteServer = settings.get('remoteServer');
        var authToken  = settings.get('authToken');

        console.log(remoteServer, authToken);

        if (remoteServer && authToken) {
            var host = remoteServer;
            var xhr = new XMLHttpRequest();
            var url = host + '/info?token=' + authToken;

            xhr.open("GET", url);

            xhr.onload = function() {
                if (xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);

                    if (json.PROTOCOL_VERSION != self.PROTOCOL_VERSION) {
                        throw "Protocol version mismatch";
                    }

                    self.path = json.path;

                    eventSystem.callEventListeners('connected', host);
                } else {
                    console.log('Error:', xhr.responseText);
                    eventSystem.callEventListeners('disconnected', host);
                }
            };

            xhr.onerror = function() {
                eventSystem.callEventListeners('disconnected', host);
            };

            xhr.send();
        } else {
            console.log('No remote server configured');
        }
    };
}
