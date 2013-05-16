function ProjectsColumn(explorer, happyEdit) {
    var self = this;
    var eventSystem = happyEdit.eventSystem;
    self.$view = HTML.createProjectsList();
    self.activeIndex = 0;
    self.list = new SelectableList({
        hover: false
    });
    
    eventSystem.addEventListener('projects_loaded', function(projects) {
        projects.forEach(function(project) {
            var $view = HTML.createStartScreenProjectItem(project);
            self.list.addItem({
                model: project,
                $view: $view
            });
            self.$view.appendChild($view);
        });
        self.list.selectIndex(0);
    });
    
    self.list.onOpen = function(item) {
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
