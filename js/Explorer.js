function Explorer(happyEdit) {
    var self = this;
    self.id = Utils.count();
    self.$view = document.getElementById('explorer');
    self.columns = [];
    self.activeColumn = null;
    self.columnIndex = 0;
    
    self.onOpen = function(item) {
        var model = item.model;
        var path = model.path;

        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }

        if (model.type === 'directory') {
            self.removeAllColumnsToTheRight();
            self.addColumn(path);
            self.navigateRight();
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
        self.columns.push(col);
        self.$view.appendChild(col.$view);
    };

    self.removeColumn = function(index) {
        var col = self.columns[index];
        self.$view.removeChild(col.$view);
        self.columns.pop(index);
    };

    self.removeAllColumnsToTheRight = function() {
        var count = (self.columns.length - 1) - self.columnIndex;
        var i;
        for (i = 0; i < count; i += 1) {
            self.removeColumn(self.columns.length - 1);
        }
    };

    self.navigateRight = function() {
        var index = self.columnIndex + 1;
        if (index > self.columns.length - 1) {
            index = self.columns.length - 1;
        }
        self.selectIndex(index);
    };

    self.navigateLeft = function() {
        var index = self.columnIndex - 1;
        if (index < 0) {
            index = 0;
        }
        self.selectIndex(index);
        self.removeAllColumnsToTheRight();
    };

    self.selectIndex = function(index) {
        self.columnIndex = index;
        if (self.activeColumn) {
            self.activeColumn.blur();
        }
        self.activeColumn = self.columns[self.columnIndex];
        self.activeColumn.focus();
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
            self.navigateLeft();
            break;

            case 17:
            // do nothing, it was just the ctrl key lifted up
            break;

            case 9: // Tab
            break;

            default:
            self.activeColumn.keyDown(event);
        }
    };
    
    self.reset = function() {
        self.$view.innerHTML = '';
        self.columns = [];
        self.activeColumn = null;
        self.columnIndex = 0;
    };
    
    happyEdit.eventSystem.addEventListener('filesystem_loaded', function(fs) {
        self.reset();
        self.addColumn('.');
        self.selectIndex(0);
    });
}
