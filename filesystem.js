/**
 * System to read and write files from a remote server.
 */
function RemoteFileSystem(eventSystem) {
    var self = this;
    self.files;
    self.autoSuggestList = null;
    self.path = null;
    self.host = null;
    self.interval = null;
    self.connectionProblem = false;

    // Ping remote to make sure we're connected.
    eventSystem.addEventListener('connected', function(host) {
        var pingUrl = host + '/ping';

        self.interval = window.setInterval(function() {
            var xhr = new XMLHttpRequest();
            var url = host + '/ping';
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
    
    eventSystem.addEventListener('connected', function(host) {
        var xhr = new XMLHttpRequest();
        var url = host + '/files';

        self.host = host;
        self.autoSuggestList = new AutoSuggestableFileList();
    
        Storage.get('settings', {}, function(settings) {
            var options = []

            if (settings.ignoredExtensions) {
                options.push('ignored_extensions=' + settings.ignoredExtensions.join(','));
            }
            if (settings.ignoredDirectories) {
                options.push('ignored_directories=' + settings.ignoredDirectories.join(','));
            }

            if (options.length) {
                url += '?' + options.join('&');
            }

            xhr.open("GET", url);

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.responseText) {
                        var json = JSON.parse(xhr.responseText);
                        self.autoSuggestList.load(json);
                        self.files = json;
                    }
                }
            };

            xhr.send();
        });
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

        if (!autoCompletions) {
            autoCompletions = self.files;
        }

        if (autoCompletions) {
            for (i = 0; i < autoCompletions.length; i += 1) {
                autoCompletion = autoCompletions[i];
                var split = autoCompletion.split(PATH_SEPARATOR);
                suggestions.push({
                    title: split.pop(),
                    extra: capFileName(autoCompletion, 60),
                    rel: autoCompletion
                });
            }
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
        var url = self.host + '/files/' + encodeURIComponent(filename);
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

    /**
     * Called when server settings is configured.
     */
    self.load = function() {
        Storage.get('settings', {}, function(data) {
            if (data.remoteServer) {
                var host = data.remoteServer;
                var xhr = new XMLHttpRequest();
                var url = host + '/info';
            
                xhr.open("GET", url);
            
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.responseText) {
                            var json = JSON.parse(xhr.responseText);
                            self.path = json.path;
                            self.host = host;
                            eventSystem.callEventListeners('connected', host);
                        } else {
                            eventSystem.callEventListeners('connection_problem', host);
                        }
                    }
                };
                xhr.send();
            } else {
                console.log('No remote server configured');
            }
        });
    };
};
