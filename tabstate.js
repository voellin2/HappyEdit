/**
 * Saves the current tab state to "Storage". When started, it restores the
 * tab state.
 */
function TabState(happyEdit) {
    var self = this;
    var eventSystem = happyEdit.eventSystem;
    self.KEY = 'happyedit_tabstate';
    
    eventSystem.addEventListener('filesystem_loaded', function() {
        self.restore();
    });
    
    eventSystem.addEventListener('file_loaded', function(file) {
        self.save();
    });
    
    eventSystem.addEventListener('file_closed', function(file) {
        self.save();
    });
    
    eventSystem.addEventListener('tabs_swapped', function(file) {
        self.save();
    });
    
    self.restore = function() {
        Storage.get(self.KEY, [], function(data) {
            data.forEach(function(filename, i) {
                happyEdit.openRemoteFile(filename);
            });
        });
    };
    
    self.save =  function() {
        var tabState = [];
        
        happyEdit.topBar.tabs.forEach(function(tab, i) {
            if (tab.file && tab.file.constructor === Buffer) {
                tabState.push(tab.file.filename);
            }
        });
        
        Storage.set(self.KEY, tabState, function() {
        });
    };
}