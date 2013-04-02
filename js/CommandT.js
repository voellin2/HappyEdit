function CommandT(eventSystem, fileSystem) {
    var self = this;
    self.files = [];
    self.autoSuggestList = new FilterList();

    eventSystem.addEventListener('connected', function(host) {
        self.autoSuggestList.clear();
        self.files = [];
    });
    
    eventSystem.addEventListener('filesystem_loaded', function() {
        self.files = [];

        var key;
        var i;
        var node;
        var file;

        for (key in fileSystem.fileTree) {
            if (fileSystem.fileTree.hasOwnProperty(key)) {
                node = fileSystem.fileTree[key];
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
    });
    
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
                extra: Utils.capFileName(autoCompletion, 60),
                rel: autoCompletion
            });
        }

        return suggestions;
    };
}
