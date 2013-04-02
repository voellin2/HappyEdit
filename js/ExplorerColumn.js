function ExplorerColumn(dir, key) {
    var self = this;
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

        Utils.removeClass($old, 'active');
        Utils.addClass($new, 'active');

        if ($new) {
            $new.scrollIntoViewIfNeeded(false);
        }
    };
    
    self.getActiveRow = function() {
        return self.$view.querySelector('.active');
    };
    
    self.focus = function() {
        Utils.addClass(self.$view, 'active');
        self.$view.scrollIntoViewIfNeeded();
    };
    
    self.blur = function() {
        Utils.removeClass(self.$view, 'active');
    };
    
    self.selectIndex(0);
}