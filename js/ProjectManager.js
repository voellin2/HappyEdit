/**
 * Listens for the 'connected' event and correctly updates
 * dataStore.projects and dataStore.currentProjectIndex.
 */
function ProjectManager(happyEdit) {
    var self = this;
    
    self.project = null;
    
    var eventSystem = happyEdit.eventSystem;
    var dataStore = happyEdit.dataStore;
    var fileSystem = happyEdit.fileSystem;
    
    eventSystem.addEventListener('connected', function(data) {
        self.addOrUpdateProject(data.host, data.authToken);
        self.loadProject(data.host);
    });
    
    self.addOrUpdateProject = function(host, authToken) {
        var project = self.getProjectByHost(host);
        var projects = dataStore.get('projects');
        
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

        dataStore.save();
        
        self.loadProject(project.host);
    };
    
    self.removeProject = function(host) {
        var projects = dataStore.get('projects');
        var newProjects = [];
        
        projects.forEach(function(project) {
            if (project.host !== host) {
                newProjects.push(project);
            }
        });
        
        dataStore.set('projects', newProjects);
    };
    
    self.getProjects = function() {
        return dataStore.get('projects');
    };
    
    self.renameCurrentProject = function(name) {
        if (!self.project) {
            throw "No current project";
        }
        
        self.project.name = name;
        dataStore.save();
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
        
        dataStore.set('currentProjectHost', null);
        dataStore.save();
        
        eventSystem.callEventListeners('disconnected');
    };
    
    self.loadProject = function(host) {
        var project = self.getProjectByHost(host);
        
        if (!project) {
            throw "No project found for " + host;
        }
        
        happyEdit.reset();
        
        self.project = project;
        
        dataStore.set('currentProjectHost', project.host);
        dataStore.save();
        
        fileSystem.loadFiles(project.host, project.authToken);
        eventSystem.callEventListeners('project_loaded', project);
    };
    
    self.getCurrentProject = function() {
        return self.project;
    };
    
    self.getProjectByHost = function(host) {
        var ret;
        var projects = dataStore.get('projects');
        
        projects.forEach(function(project) {
            if (project.host === host) {
                ret = project;
                return false;
            }
        });
        
        return ret;
    };
    
    self.createAutoCompletions = function() {
        var projects = dataStore.get('projects');
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
    
    self.createAutoCompletions();
}
