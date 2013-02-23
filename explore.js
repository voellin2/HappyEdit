function Explorer(happyEdit) {
    var self = this;
    self.columns = [];
    self.activeColumn = null;
    self.columnIndex = 0;

    self.$view = HTML.createExplorer({
        fileSystem: happyEdit.fileSystem,
    });

    self.addColumn = function(key) {
        console.log('opening', key);
        var dir = happyEdit.fileSystem.fileTree[key];
        var col = new ExplorerColumn(dir, key);
        self.columns.push(col);
        self.$view.appendChild(col.$view);
    };

    self.removeColumn = function(index) {
        console.log('removing index ', index);
        var col = self.columns[index];
        self.$view.removeChild(col.$view);
        self.columns.pop(index);
    };

    self.removeAllColumnsToTheRight = function() {
        var count = (self.columns.length - 1) - self.columnIndex;
        console.log('count', count);
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
    };

    self.selectIndex = function(index) {
        self.columnIndex = index;
        if (self.activeColumn) {
            self.activeColumn.blur();
        }
        self.activeColumn = self.columns[self.columnIndex];
        self.activeColumn.focus();
    };
    
    happyEdit.$explorers.appendChild(self.$view);
    
    self.getTabLabel = function() {
        return 'Explore';
    };
    
    self.onChange = function(callback) {
    };
    
    self.blur = function() {
        happyEdit.$explorers.style.display = 'none';
        happyEdit.$editor.style.display = 'block';
        happyEdit.popGlobalKeyboardHandler();
    };

    self.focus = function() {
        var $elems = happyEdit.$explorers.querySelectorAll('.explorer');
        var i;
        
        for (i = 0; i < $elems.length; i += 1) {
            $elems[i].style.display = 'none';
        }

        self.$view.style.display = 'block';
        happyEdit.$explorers.style.display = 'block';
        happyEdit.$editor.style.display = 'none';
        //happyEdit.editor.blur();
        happyEdit.pushGlobalKeyboardHandler(self.getGlobalKeyboardHandler());
    };
    
    self.keyDown = function(event) {
        keyCode = event.keyCode;

        if (keyCode === 78 || keyCode === 74) {
            keyCode = 40;
        } else if (keyCode === 80 || keyCode === 75) {
            keyCode = 38;
        }

        switch (keyCode) {
            case 27:
            // Leave?
            break;

            case 40:
            self.activeColumn.navigateDown();
            break;

            case 38:
            self.activeColumn.navigateUp();
            break;

            case 72:
            self.navigateLeft();
            break;

            case 76:
            self.navigateRight();
            break;

            case 17:
            // do nothing, it was just the ctrl key lifted up
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
    
    self.getGlobalKeyboardHandler = function() {
        return self.keyDown;
    };
    
    self.openActiveItem = function() {
        var $row = self.activeColumn.getActiveRow();
        var key = self.activeColumn.$view.getAttribute('rel') + '/' + $row.innerHTML;

        if (key.substr(0, 2) === './') {
            key = key.substr(2); 
        }

        if (hasClass($row, 'directory')) {
            self.removeAllColumnsToTheRight();
            self.addColumn(key);
            self.navigateRight();
        } else {
            happyEdit.openRemoteFile(key);
        }
    };
    
    self.addColumn('.');
    self.selectIndex(0);
}
