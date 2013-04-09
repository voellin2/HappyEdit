/**
 * Saves the current tab state to the current project. When a project is loaded
 * it restores the tab state.
 */
function TabState(happyEdit) {
    var self = this;
    self.project = null;
    
    var eventSystem = happyEdit.eventSystem;
    var settings = happyEdit.settings;
    
    self.restore = function() {
        if (self.project.tabs.length === 0) {
            happyEdit.openFileExplorer();
            return;
        }
        
        self.project.tabs.forEach(function(filename) {
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
        
        self.project.tabs = tabs;
        
        // project is a reference to an item in settings.
        settings.save();
    };
    
    eventSystem.addEventListener('project_loaded', function(project) {
        self.project = project;
        self.restore();
    });
    
    eventSystem.addEventListener('disconnected', function() {
        self.project = null;
    });
    
    eventSystem.addEventListener('file_loaded', self.save);
    eventSystem.addEventListener('file_closed', self.save);
    eventSystem.addEventListener('tabs_swapped', self.save);
}
