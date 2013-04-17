function ExplorerColumn(dir, key) {
    var self = this;
    self.$view = HTML.createDirectoryView(dir);
    self.activeIndex = 0;
    self.list = new SelectableList();
    self.dirname = key;
    
    function addItems(list, type) {
        list.forEach(function(filename) {
            var model = {
                path: self.dirname + '/' + filename,
                filename: filename,
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
        Utils.addClass(self.$view, 'active');
        self.$view.scrollIntoViewIfNeeded();
    };
    
    self.blur = function() {
        Utils.removeClass(self.$view, 'active');
    };
}