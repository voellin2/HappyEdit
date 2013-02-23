function ExplorerColumn(dir, key) {
    var self = this;
    var $explorers = document.querySelector("#explorers");
    self.$view = HTML.createDirectoryView(dir, key);
    self.activeIndex = 0;
    
    self.navigateUp = function() {
        var index = self.activeIndex - 1;
        if (index < 0) {
            index = 0;
        }
        self.selectIndex(index);
    };
    
    self.navigateDown = function() {
        var index = self.activeIndex + 1;
        var len = dir.files.length + dir.directories.length;
        if (index >= len) {
            index = len - 1;
        }
        self.selectIndex(index);
    };
    
    self.selectIndex = function(index) {
        self.activeIndex = index;

        var $old = self.$view.querySelector('.active');
        var $new = self.$view.querySelector('.item' + index);

        removeClass($old, 'active');
        addClass($new, 'active');

        $new.scrollIntoViewIfNeeded(false);
    };
    
    self.getActiveRow = function() {
        return self.$view.querySelector('.active');
    };
    
    self.focus = function() {
        addClass(self.$view, 'active');
    };
    
    self.blur = function() {
        removeClass(self.$view, 'active');
    };
    
    self.selectIndex(0);
}