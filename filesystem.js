/**
 * System to read and write files from a remote server.
 */
function RemoteFileSystem(eventSystem) {
    var self = this;
    self.fileTree = {};
    self.files = [];
    self.autoSuggestList = new AutoSuggestableFileList();
    self.path = null;
    self.host = null;
    self.interval = null;
    self.connectionProblem = false;
    self.PROTOCOL_VERSION = "0.1";
    self.authToken = null;

    // Ping remote to make sure we're connected.
    eventSystem.addEventListener('connected', function(host) {
        var pingUrl = host + '/ping';

        self.interval = window.setInterval(function() {
            var xhr = new XMLHttpRequest();
            var url = host + '/ping?token=' + self.authToken;
            xhr.open("GET", url);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (!xhr.responseText && !self.connectionProblem) {
                        self.connectionProblem = true;
                        eventSystem.callEventListeners('connection_problem', host);
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

        self.autoSuggestList.load(self.files);
    };

    eventSystem.addEventListener('connected', function(host) {
        var xhr = new XMLHttpRequest();
        var url = host + '/files?token=' + self.authToken;

        self.host = host;
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
        var autoCompletions = this.autoSuggestList.getSuggestions(q);
        var autoCompletion;

        if (!autoCompletions.length) {
            autoCompletions = self.files;
        }

        for (i = 0; i < autoCompletions.length; i += 1) {
            autoCompletion = autoCompletions[i];
            var split = autoCompletion.split(PATH_SEPARATOR);
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
        var url = self.host + '/files/' + encodeURIComponent(filename) + '?token=' + self.authToken;
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

    self.connect = function(args) {
        // TODO: host and password should really be taken from args, but
        // command line does not support multiple arguments
        // for commands and not arguments with ':' in them.
        var host = 'http://localhost:8888';
        var password = 'test123';

        var xhr = new XMLHttpRequest();
        var url = host + '/connect';
        var params = 'password=' + encodeURIComponent(password);

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            var json = JSON.parse(xhr.responseText);
            happyEdit.settings.set('authToken', json.authToken, function() {
                self.authToken = json.authToken
                self.load();
            });
        };

        xhr.send(params);
    };

    /**
     * Called when server settings is configured.
     */
    self.load = function() {
        Storage.get('settings', {}, function(data) {
            if (data.remoteServer && data.authToken) {
                var host = data.remoteServer;
                var xhr = new XMLHttpRequest();
                var url = host + '/info?token=' + data.authToken;
            
                xhr.open("GET", url);
            
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        var json = JSON.parse(xhr.responseText);

                        if (json.PROTOCOL_VERSION != self.PROTOCOL_VERSION) {
                            throw "Protocol version mismatch";
                        }

                        self.path = json.path;
                        self.host = host;
                        self.authToken = data.authToken;

                        eventSystem.callEventListeners('connected', host);
                    } else {
                        console.log('Error:', xhr.responseText);
                        eventSystem.callEventListeners('connection_problem', host);
                    }
                };

                xhr.onerror = function() {
                    eventSystem.callEventListeners('connection_problem', host);
                };

                xhr.send();
            } else {
                console.log('No remote server configured');
            }
        });
    };
}
