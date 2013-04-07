/**
 * Listens for the 'connected' event and correctly updates
 * settings.projects and settings.currentProjectIndex.
 */
function ProjectManager(happyEdit) {
    var self = this;
    var eventSystem = happyEdit.eventSystem;
    var settings = happyEdit.settings;
    var fileSystem = happyEdit.fileSystem;
    
    eventSystem.addEventListener('connected', function(data) {
        self.addOrUpdateProject(data.host, data.authToken);
        self.loadProject(data.host);
    });
    
    self.addOrUpdateProject = function(host, authToken) {
        var project = self.getProjectByHost(host);
        var projects = settings.get('projects');
        
        if (project ) {
            project .authToken = authToken;
        } else {
            project = {
                host: host,
                authToken: authToken,
                tabs: []
            };
            projects.push(project);
            self.createAutoCompletions();
        }

        settings.save();
        
        self.loadProject(project.host);
    };

    self.disconnect = function() {
        happyEdit.closeAllOpenFiles();
        happyEdit.openDummyBuffer();
        
        settings.set('currentProjectHost', null);
        settings.save();
        
        eventSystem.callEventListeners('disconnected');
    };
    
    self.getCurrentProject = function() {
        var host = settings.get('currentProjectHost');
        if (host !== null) {
            return self.getProjectByHost();
        }
    };
    
    self.loadProject = function(host) {
        var project = self.getProjectByHost(host);
        
        if (!project) {
            throw "No project found for " + host;
        }
        
        happyEdit.closeAllOpenFiles();
        
        settings.set('currentProjectHost', project.host);
        settings.save();
        
        fileSystem.loadFiles(project.host, project.authToken);
        eventSystem.callEventListeners('project_loaded', project);
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
            var keys = [project.host, 'switch', 'change'];
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
        var suggestions = self.autoCompletions.getSuggestions(q);
        var host;
        var project;
        
        suggestions.forEach(function(host) {
            project = self.getProjectByHost(host);
            ret.push({
                title: project.name || project.host,
                extra: 'Switch to project',
                rel: project.host
            });
        });
        
        return ret;
    };
    
    self.createAutoCompletions();
}
