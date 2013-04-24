function StartScreen(happyEdit) {
    var self = this;
    self.$view = document.querySelector('#start');
    self.$ul = self.$view.querySelector('ul');
    self.id = Utils.count();
    self.list = new SelectableList();
    
    var eventSystem = happyEdit.eventSystem;
    
    self.list.onOpen = function(item) {
        happyEdit.projectManager.switchProject(item.model);
    };
    
    eventSystem.addEventListener('disconnected', function() {
        self.list.clear();
        self.$ul.innerHTML = '';
    });
    
    eventSystem.addEventListener('projects_loaded', function(projects) {
        projects.forEach(function(project) {
            var $view = HTML.createStartScreenProjectItem(project);
            self.list.addItem({
                model: project,
                $view: $view
            });
            self.$ul.appendChild($view);
        });
    });
    
    self.keyDown = function(event) {
        self.list.keyDown(event);
    };
    
    self.getTabLabel = function() {
        return 'Start';
    };
    
    self.onChange = function(callback) {
    };
    
    self.blur = function() {
        self.$view.style.display = 'none';
        happyEdit.$editor.style.display = 'block';
        happyEdit.popTabSpecificKeyboardHandler();
    };

    self.focus = function() {
        self.$view.style.display = 'block';
        happyEdit.$editor.style.display = 'none';
        happyEdit.pushTabSpecificKeyboardHandler(self.keyDown);
    };
}
