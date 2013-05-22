function ExplorerColumn(explorer, happyEdit, dir, key) {
    var self = this;
    self.$view = HTML.createDirectoryView(dir);
    self.activeIndex = 0;
    self.dirname = key;
    self.list = new SelectableList({
        hover: false,
        autoSuggestFirst: false
    });
    
    self.list.onSelect = function(item) {
        var model = item.model;
        var path = model.path;
        var myIndex = self.$view.dataset.index;
        
        explorer.removeAllColumnsToTheRight(myIndex);
        
        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }
        
        if (model.type === 'directory') {
            explorer.addColumn(path);
        }
    };
    
    self.list.onOpen = function(item) {
        var model = item.model;
        var path = model.path;

        if (path.substr(0, 2) === './') {
            path = path.substr(2);
        }

        if (model.type === 'file') {
            happyEdit.openRemoteFile(path);
        }
    };
    
    function addItems(list, type) {
        list.forEach(function(filename) {
            var model = {
                path: self.dirname + '/' + filename,
                title: filename,
                type: type
            };
            
            var $view = HTML.createExplorerItem(model);
            
            self.list.addItem({
                model: model,
                $view: $view
            });
            
            self.$view.appendChild($view);
        });
    }
    
    addItems(dir.directories, 'directory');
    addItems(dir.files, 'file');
    
    self.keyDown = function(event) {
        self.list.keyDown(event);
    };
    
    self.focus = function() {
        if (!self.list.getIndex()) {
            self.list.selectIndex(0);
        }
        Utils.addClass(self.$view, 'active');
        self.$view.scrollIntoViewIfNeeded();
    };
    
    self.blur = function() {
        Utils.removeClass(self.$view, 'active');
    };
}