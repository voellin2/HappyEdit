function ProjectsColumn(explorer, happyEdit) {
    var self = this;
    var eventSystem = happyEdit.eventSystem;
    self.$view = HTML.createDirectoryView();
    self.activeIndex = 0;
    self.list = new SelectableList({
        hover: false
    });
    
    eventSystem.addEventListener('projects_loaded', function(projects) {
        self.list.clear();
        self.$view.innerHTML = '';
        
        projects.forEach(function(project) {
            var $view = HTML.createExplorerItem({
                title: project.title,
                type: 'project'
            });
            self.list.addItem({
                model: project,
                $view: $view
            });
            self.$view.appendChild($view);
        });
        
        self.list.selectIndex(0);
    });
    
    self.list.onSelect = function(item) {
        var model = item.model;
        happyEdit.projectManager.switchProject(item.model);
    };
    
    self.keyDown = function(event) {
        self.list.keyDown(event);
    };
    
    self.focus = function() {
        Utils.addClass(self.$view, 'active');
        self.$view.scrollIntoViewIfNeeded();
    };
    
    self.blur = function() {
        Utils.removeClass(self.$view, 'active');
    };
}
