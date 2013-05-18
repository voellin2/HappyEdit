function HomeScreen(happyEdit) {
    var self = this;
    self.sticky = true;
    self.id = Utils.count();
    self.explorer = new Explorer(happyEdit);
    self.$view = document.getElementById('home');
    self.$controls = self.$view.querySelector('.controls');
    self.$settingsButton = self.$controls.querySelector('.settings');
    
    self.$settingsButton.onclick = function() {
        happyEdit.showSettings();
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
        self.resize();
    };
    
    self.keyDown = function(event) {
        self.explorer.keyDown(event);
    };
    
    self.resize = function() {
        var w = self.$view.offsetWidth;
        var h = self.$view.offsetHeight;
        var borderHeight = 1;
        var controlsHeight = self.$controls.offsetHeight;
        self.explorer.$view.style.width = w + 'px';
        self.explorer.$view.style.height = (h - controlsHeight - borderHeight) + 'px';
    };
}
