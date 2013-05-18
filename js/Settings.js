function Settings(happyEdit) {
    var self = this;
    self.id = Utils.count();
    self.$view = document.getElementById('settings');
    
    self.isDummy = function() {
        return false;
    };

    self.getTabLabel = function() {
        return 'Settings';
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
    };
}
