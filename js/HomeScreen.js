function HomeScreen(happyEdit) {
    var self = this;
    self.sticky = true;
    self.id = Utils.count();
    self.explorer = new Explorer(happyEdit);
    self.$view = document.getElementById('home');
    self.$controls = self.$view.querySelector('.controls');
    self.$commandLineButton = self.$controls.querySelector('.command-line');
    
    self.$commandLineButton.onclick = function() {
        happyEdit.commandLine.show();
    };
    
    self.isDummy = function() {
        return false;
    };

    self.getTabLabel = function() {
        return 'Home';
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
        self.explorer.keyDown(event);
    };
}
