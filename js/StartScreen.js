function StartScreen(happyEdit) {
    var self = this;
    self.$view = document.querySelector('#start');
    self.$ul = self.$view.querySelector('ul');
    self.id = Utils.count();
    self.list = new SelectableList();
    
    happyEdit.projectManager.getProjects().forEach(function(project) {
        var $view = HTML.createStartScreenProjectItem(project);
        self.list.addItem({
            model: project,
            $view: $view
        });
        self.$ul.appendChild($view);
    });
    
    self.keyDown = function(event) {
        var keyCode = event.keyCode;

        if (keyCode === 78 || keyCode === 74) {
            keyCode = 40;
        } else if (keyCode === 80 || keyCode === 75) {
            keyCode = 38;
        }

        switch (keyCode) {
            case 40:
            self.list.navigateDown();
            break;

            case 38:
            self.list.navigateUp();
            break;

            case 9: // Tab
            break;

            case 13:
            self.openActiveItem();
            break;

            default:
            // Empty for now
        }
    };
    
    self.openActiveItem = function() {
        var item = self.list.getSelectedItem();
        
        if (!item) {
            return;
        }
        
        happyEdit.projectManager.loadProject(item.model.host);
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
