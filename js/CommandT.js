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
}
