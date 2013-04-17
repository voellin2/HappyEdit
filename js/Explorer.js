function Explorer(happyEdit) {
    var self = this;
    self.id = Utils.count();
    self.$view = document.getElementById('explorer');
    self.list = new SelectableList(self.$view);
    
    self.onOpen = function(item) {
        var model = item.model;
        var path = model.path;

        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }

        if (model.type === 'directory') {
            self.removeAllColumnsToTheRight();
            self.addColumn(path);
            self.list.navigateDown();
        } else {
            happyEdit.openRemoteFile(path);
         }
     };

    self.isDummy = function() {
        return false;
    };

    self.addColumn = function(key) {
        var dir = happyEdit.fileSystem.fileTree[key];
        var col = new ExplorerColumn(dir, key);
        col.list.onOpen = self.onOpen;
        
        self.list.addItem({
            model: col,
            $view: col.$view
        });
        
        self.$view.appendChild(col.$view);
    };

    self.removeAllColumnsToTheRight = function() {
        var count = (self.list.getLength() - 1) - self.list.getIndex();
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

        if (keyCode === 78 || keyCode === 74) {
            keyCode = 40;
        } else if (keyCode === 80 || keyCode === 75) {
            keyCode = 38;
        }

        switch (keyCode) {
            case 27:
            // Leave?
            break;

            case 72:
            self.list.navigateUp();
            self.removeAllColumnsToTheRight();
            break;

            default:
            self.list.getSelectedItem().model.keyDown(event);
        }
    };
    
    self.reset = function() {
        self.$view.innerHTML = '';
        self.list.clear();
    };
    
    happyEdit.eventSystem.addEventListener('filesystem_loaded', function(fs) {
        self.reset();
        self.addColumn('.');
    });
}
