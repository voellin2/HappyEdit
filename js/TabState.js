/**
 * Saves the current tab state to the current project. When a project is loaded
 * it restores the tab state.
 */
function TabState(happyEdit) {
    var self = this;
    
    self.project = null;
    
    var eventSystem = happyEdit.eventSystem;
    var dataStore = happyEdit.dataStore;
    
    self.tabState = dataStore.get('tabState', {});
    
    // Make sure dataStore has a reference to our tabState.
    dataStore.set('tabState', self.tabState);
    
    self.getKey = function() {
        return happyEdit.server.host + ':' + self.project.id;
    };
    
    self.restore = function() {
        var key = self.getKey();
        var tabs = [];
        
        if (self.tabState.hasOwnProperty(key)) {
            tabs = self.tabState[key];
        }
        
        if (tabs.length === 0) {
            happyEdit.openHomeScreen();
            return;
        }
        
        tabs.forEach(function(filename) {
            happyEdit.openRemoteFile(filename, 0, false);
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
        
        self.tabState[self.getKey()] = tabs;
        
        // dataStore has a reference to self.tabState
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
