function StartScreen(happyEdit) {
    var self = this;
    self.$view = document.querySelector('#start');
    self.$projects = self.$view.querySelector('.projects');
    self.$ul = self.$view.querySelector('ul');
    self.$connectButton = self.$view.querySelector('.connect-button');
    self.id = Utils.count();
    self.list = new SelectableList();
    
    self.$connectButton.onclick = function(event) {
        var host = self.$view.querySelector('input[name=host]').value;
        var password = self.$view.querySelector('input[name=password]').value;
        
        if (!host) {
            happyEdit.notifications.show('A hostname must be provided.');
            return;
        }
        
        if (!password) {
            happyEdit.notifications.show('A password must be provided.');
            return;
        }
        
        happyEdit.server.connect(host, password, function(error) {
            if (error) {
                happyEdit.notifications.show(error);
            } else {
                happyEdit.notifications.hide();
            }
        });
        
        event.stopPropagation();
        event.preventDefault();
    };
    
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
        if (self.$projects.display === 'none') {
            return;
        }
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
