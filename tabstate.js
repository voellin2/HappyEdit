function TabState(happyEdit) {
    var self = this;
    
    self.KEY = 'happyedit_tabstate';
    self.tabState = [];
    
    eventSystem = happyEdit.eventSystem;
    fileSystem = happyEdit.filesystem;
    
    eventSystem.addEventListener('filesystem_loaded', function() {
        self.restore();
    });
    
    eventSystem.addEventListener('file_loaded', function(file) {
        self.tabState.push(file.filename);
        self.save();
    });
    
    eventSystem.addEventListener('file_closed', function(file) {
        var index = self.tabState.indexOf(file.filename);
        if (index !== -1) {
            self.tabState.splice(index, 1);
        }
        self.save();
    });
    
    self.restore = function() {
        Storage.get(self.KEY, self.tabState, function(data) {
            data.forEach(function(filename, i) {
                happyEdit.openRemoteFile(filename);
            });
            self.tabState = data;
        });
    };
    
    self.save =  function() {
        Storage.set(self.KEY, self.tabState, function() {
        });
    };
}