function ExplorerColumn(dir, key) {
    var self = this;
    self.$view = HTML.createDirectoryView(dir, key);
    self.activeIndex = 0;
    
    self.navigateUp = function() {
        self.activeIndex -= 1;
        if (self.activeIndex < 0) {
            self.activeIndex = 0;
        }
        self.selectIndex(self.activeIndex);
    };
    
    self.navigateDown = function() {
        self.activeIndex += 1;
        var len = happyEdit.fileSystem.files.length;
        if (self.activeIndex === len) {
            self.activeIndex = len - 1;
        }
        self.selectIndex(self.activeIndex);
    };
    
    self.selectIndex = function(index) {
        var $old = self.$view.querySelector('.active');
        var $new = self.$view.querySelector('.item' + index);
        removeClass($old, 'active');
        addClass($new, 'active');
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