/**
 * Listens for the 'connected' event and correctly updates
 * settings.projects and settings.currentProjectIndex.
 */
function ProjectManager(happyEdit) {
    var self = this;
    var eventSystem = happyEdit.eventSystem;
    var settings = happyEdit.settings;
    
    eventSystem.addEventListener('connected', function(data) {
        var existingProject = self.getProjectByHost(data.host);
        var projects = settings.get('projects');
        
        if (existingProject) {
            existingProject.authToken = data.authToken;
        } else {
            settings.set('currentProjectIndex', projects.length);
            projects.push({
                host: data.host,
                authToken: data.authToken
            });
            self.createAutoCompletions();
        }
        
        settings.save();
    });
    
    self.disconnect = function() {
        settings.set('currentProjectIndex', 0);
        settings.save();
        eventSystem.callEventListeners('disconnected');
    };
    
    self.getCurrentProject = function() {
        var index = settings.get('currentProjectIndex');
        if (index) {
            return settings.get('projects')[settings.currentProjectIndex];
        }
    };
    
    self.getProjectByHost = function(host) {
        var ret;
        var projects = settings.get('projects');
        
        projects.forEach(function(project) {
            if (project.host === host) {
                ret = project;
                return false;
            }
        });
        
        return ret;
    };
    
    self.createAutoCompletions = function() {
        var projects = settings.get('projects');
        var map = projects.map(function(project) {
            var keys = [project.host];
            return {
                value: project.host,
                keys: keys
            };
        });
        
        self.autoCompletions = new FilterList(map);
    };
    
    /**
     * Gets a list of auto completions in the format expected by the
     * CommandLine.
     */
    self.getSuggestions = function(q) {
        var ret = [];
        var autoCompletions = self.autoCompletions.getSuggestions(q);
        var host;
        var project;
        
        self.autoCompletions.forEach(function(host) {
            project = self.getProjectByHost(host);
            ret.push({
                title: project.host,
                extra: 'Switch to project',
                rel: project.host
            });
        });
        
        return ret;
    };
    
    self.createAutoCompletions();
}
