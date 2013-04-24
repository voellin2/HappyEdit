/**
 * Listens for the 'connected' event and correctly updates
 * dataStore.projects and dataStore.currentProjectIndex.
 */
function ProjectManager(happyEdit) {
    var self = this;
    
    self.filterList = new FilterList();
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
            self.createFilterList();
        };
        
        xhr.send();
    };
    
    self.getProjectById = function(id) {
        var ret;
        
        self.projects.forEach(function(project) {
            if (project.id === id) {
                ret = project;
                return false;
            }
        });
        
        return ret;
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
    
    self.createFilterList = function() {
        var projects = self.projects || [];
        
        var map = projects.map(function(project) {
            var keys = [project.title, 'switch', 'change'];

            return {
                value: project.id,
                keys: keys
            };
        });
        
        self.filterList.load(map);
    };
    
    self.createFilterList();
}
