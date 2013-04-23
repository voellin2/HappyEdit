/**
 * Listens for the 'connected' event and correctly updates
 * dataStore.projects and dataStore.currentProjectIndex.
 */
function ProjectManager(happyEdit) {
    var self = this;
    
    self.server = null;
    self.project = null;
    self.projects = [];
    
    var eventSystem = happyEdit.eventSystem;
    var dataStore = happyEdit.dataStore;
    var fileSystem = happyEdit.fileSystem;
    
    eventSystem.addEventListener('connected', function(server) {
        self.server = server;
        self.loadProjects();
    });
    
    self.loadProjects = function() {
        var server = self.server;
        var xhr = new XMLHttpRequest();
        var url = server.host + '/projects?token=' + server.authToken;
        
        xhr.open("GET", url);
        
        xhr.onload = function() {
            self.projects = JSON.parse(xhr.responseText);
            eventSystem.callEventListeners('projects_loaded', self.projects);
        };
        
        xhr.send();
    };
    
    self.getProjects = function() {
        return self.projects;
    };
    
    self.switchProject = function(project) {
        happyEdit.reset();
        self.project = project;
        eventSystem.callEventListeners('project_switched', project);
    };
    
    self.getCurrentProject = function() {
        return self.project;
    };
    
    self.createAutoCompletions = function() {
        var projects = self.projects || [];
        
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
