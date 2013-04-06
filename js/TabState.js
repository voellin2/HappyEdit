/**
 * Saves the current tab state to the current project. When a project is loaded
 * it restores the tab state.
 */
function TabState(happyEdit) {
    var self = this;
    self.project = null;
    
    var eventSystem = happyEdit.eventSystem;
    var settings = happyEdit.settings;
    
    eventSystem.addEventListener('project_loaded', function(project) {
        self.project = project;
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
        self.project.tabs.forEach(function(filename) {
            happyEdit.openRemoteFile(filename);
        });
    };
    
    self.save =  function() {
        var tabState = [];
        
        happyEdit.topBar.tabs.forEach(function(tab) {
            if (tab.file && tab.file.constructor === Buffer) {
                self.project.tabs.push(tab.file.filename);
            }
        });
        
        // project is a reference to an item in settings.
        settings.save();
    };
}
