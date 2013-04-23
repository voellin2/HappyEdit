/**
 * Saves the current tab state to the current project. When a project is loaded
 * it restores the tab state.
 */
function TabState(happyEdit) {
    var self = this;
    
    self.project = null;
    self.server = null;
    
    var eventSystem = happyEdit.eventSystem;
    var dataStore = happyEdit.dataStore;
    
    self.getKey = function() {
        if (self.server && self.project) { 
            return self.server.host + ':' + self.project.id;
        }
    };
    
    self.restore = function() {
        var tabs = dataStore.get(self.getKey(), []);
        
        if (tabs.length === 0) {
            happyEdit.openFileExplorer();
            return;
        }
        
        tabs.forEach(function(filename) {
            happyEdit.openRemoteFile(filename);
        });
    };
    
    self.save =  function() {
        if (!self.project) {
            return;
        }
        
        var tabs = [];

        happyEdit.topBar.tabs.forEach(function(tab) {
            if (tab.pane.constructor === Buffer) {
                tabs.push(tab.pane.filename);
            }
        });
        
        dataStore.set(self.getKey(), tabs);
        dataStore.save();
    };
    
    eventSystem.addEventListener('project_switched', function(project) {
        self.project = project;
        self.restore();
    });
    
    eventSystem.addEventListener('disconnected', function() {
        self.project = null;
        self.server = null;
    });
    
    eventSystem.addEventListener('file_loaded', self.save);
    eventSystem.addEventListener('file_closed', self.save);
    eventSystem.addEventListener('tabs_swapped', self.save);
}
