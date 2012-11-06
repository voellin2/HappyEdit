/**
 * System to read and write files from a remote server.
 */
function RemoteFileSystem(eventSystem) {
    var self = this;
    self.autoSuggestList = null;
    self.host = null;
    
    eventSystem.addEventListener('connected', function(host) {
        var xhr = new XMLHttpRequest();
        var url = host + '/files';

        self.host = host;
        self.autoSuggestList = new AutoSuggestableFileList();
    
        /*if (ignoredExtensions) {
            url = self.host + '/files?ignored_extensions=' + ignoredExtensions.join(',');
        }*/
    
        xhr.open("GET", url);
    
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.responseText) {
                    var json = JSON.parse(xhr.responseText);
                    self.autoSuggestList.load(json);
                }
            }
        };
    
        xhr.send();
    });

    self.isConnected = function() {
        return Boolean(this.host);
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

        if (autoCompletions) {
            for (i = 0; i < autoCompletions.length; i += 1) {
                autoCompletion = autoCompletions[i];
                var split = autoCompletion.split(PATH_SEPARATOR);
                suggestions.push({
                    title: split.pop(),
                    extra: capFileName(autoCompletion, 60 - self.host.length) + ' @ ' + self.host,
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
};
