function HomeScreen(happyEdit) {
    var self = this;
    self.sticky = true;
    self.tabCssClass= 'home';
    self.id = Utils.count();
    self.explorer = new Explorer(happyEdit);
    self.$view = document.getElementById('home');
    
    self.isDummy = function() {
        return false;
    };

    self.getTabLabel = function() {
        return '⌂';
    };
    
    self.onChange = function(callback) {
    };
    
    self.blur = function() {
        happyEdit.popTabSpecificKeyboardHandler();
    };

    self.focus = function() {
        happyEdit.pushTabSpecificKeyboardHandler(self.keyDown);
        self.resize();
    };
    
    self.keyDown = function(event) {
        self.explorer.keyDown(event);
    };
    
    self.resize = function() {
        var w = self.$view.offsetWidth;
        var h = self.$view.offsetHeight;
        self.explorer.$view.style.width = w + 'px';
        self.explorer.$view.style.height = h + 'px';
    };
}
