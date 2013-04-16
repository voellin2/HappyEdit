function ExplorerColumn(dir, key) {
    var self = this;
    self.$view = HTML.createDirectoryView(dir);
    self.activeIndex = 0;
    self.list = new SelectableList();
    self.dirname = key;
    
    dir.directories.forEach(function(filename) {
        var model = {
            filename: filename,
            type: 'directory'
        };
        
        var $view = HTML.createExplorerItem(model);
        
        self.list.addItem({
            model: model,
            $view: $view
        });
        
        self.$view.appendChild($view);
    });
    
    dir.files.forEach(function(filename) {
        var model = {
            filename: filename,
            type: 'file'
        };
        
        var $view = HTML.createExplorerItem(model);
        
        self.list.addItem({
            model: model,
            $view: $view
        });
        
        self.$view.appendChild($view);
    });
    
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