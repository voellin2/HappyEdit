function Explorer(happyEdit) {
    var self = this;
    self.id = Utils.count();
    self.$view = document.getElementById('explorer');
    self.list = new SelectableList({
        $parent: self.$view,
        hover: false
    });
    
    self.isDummy = function() {
        return false;
    };

    self.addProjectsColumn = function() {
        var col = new ProjectsColumn(self, happyEdit);
        
        self.list.addItem({
            model: col,
            $view: col.$view
        });
    };

    self.addColumn = function(key) {
        var dir = happyEdit.fileSystem.fileTree[key];
        var col = new ExplorerColumn(self, happyEdit, dir, key);
        
        self.list.addItem({
            model: col,
            $view: col.$view
        });
        
        if (self.list.getLength() === 1) {
            col.list.selectIndex(0);
        }
    };

    self.removeAllColumnsToTheRight = function(index) {
        var count = (self.list.getLength() - 1) - index;
        var i;
        for (i = 0; i < count; i += 1) {
            self.list.removeItemAtIndex(self.list.getLength() - 1);
        }
    };
    
    self.getTabLabel = function() {
        return 'Explore';
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
    
    self.keyDown = function(event) {
        var keyCode = event.keyCode;

        if (keyCode === 72) {
            keyCode = 37;
        } else if (keyCode === 76) {
            keyCode = 39;
        }

        switch (keyCode) {
            case 27:
            // Leave?
            break;

            case 37:
            self.list.navigateUp();
            break;
            
            case 39:
            self.list.navigateDown();
            break;

            default:
            self.list.getSelectedItem().model.keyDown(event);
        }
    };
    
    self.reset = function() {
        self.removeAllColumnsToTheRight(1);
    };
    
    happyEdit.eventSystem.addEventListener('filesystem_loaded', function(fs) {
        self.reset();
        self.addColumn('.');
        self.list.selectIndex(0);
    });

    self.addProjectsColumn();
    self.list.selectIndex(0);
}
