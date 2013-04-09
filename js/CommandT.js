function CommandT(eventSystem, fileSystem) {
    var self = this;
    self.filterList = new FilterList();
    
    function filenameToFilterListSource(filename) {
        return {
            value: filename,
            keys: filename.substr(2).toLowerCase().split('/')
        };
    }
    
    eventSystem.addEventListener('filesystem_loaded', function() {
        self.filterList.clear();
        var files = fileSystem.getFlatList();
        self.filterList.load(files.map(filenameToFilterListSource));
    });
    
    eventSystem.addEventListener('file_created', function(buffer) {
        if (!buffer.filename) {
            return;
        }
        
        var item = filenameToFilterListSource(buffer.filename);
        self.filterList.indexItem(item);
    });
    
    /**
     * Gets a list of auto completions in the format expected by the
     * CommandLine
     */
    self.getSuggestions = function(q) {
        var suggestions = [];
        var i;
        var split;
        var autoCompletions = self.filterList.getSuggestions(q);
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
