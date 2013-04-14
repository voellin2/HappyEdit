/**
 * Listens for the 'connected' event and correctly updates
 * settings.projects and settings.currentProjectIndex.
 */
function ProjectManager(happyEdit) {
    var self = this;
    
    self.project = null;
    
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
                name: null,
                tabs: []
            };
            projects.push(project);
            self.createAutoCompletions();
        }

        settings.save();
        
        self.loadProject(project.host);
    };
    
    self.removeProject = function(host) {
        var projects = settings.get('projects');
        var newProjects = [];
        
        projects.forEach(function(project) {
            if (project.host !== host) {
                newProjects.push(project);
            }
        });
        
        settings.set('projects', newProjects);
    };
    
    self.getProjects = function() {
        return settings.get('projects');
    };
    
    self.renameCurrentProject = function(name) {
        if (!self.project) {
            throw "No current project";
        }
        
        self.project.name = name;
        settings.save();
    };
    
    self.switchProject = function(host) {
        self.project;
        
        if (self.project) {
            self.disconnect();
        }
        
        self.loadProject(host);
    };

    self.disconnect = function() {
        happyEdit.reset();
        happyEdit.openDummyBuffer();
        
        settings.set('currentProjectHost', null);
        settings.save();
        
        eventSystem.callEventListeners('disconnected');
    };
    
    self.loadProject = function(host) {
        var project = self.getProjectByHost(host);
        
        if (!project) {
            throw "No project found for " + host;
        }
        
        happyEdit.reset();
        
        self.project = project;
        
        settings.set('currentProjectHost', project.host);
        settings.save();
        
        fileSystem.loadFiles(project.host, project.authToken);
        eventSystem.callEventListeners('project_loaded', project);
    };
    
    self.getCurrentProject = function() {
        return self.project;
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

            if (project.name) {
                keys.push(project.name);
            }

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
                extra: 'Switch to project (' + project.host + ')',
                rel: project.host
            });
        });
        
        return ret;
    };
    
    self.createAutoCompletions();
}
