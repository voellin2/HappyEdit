function Settings(happyEdit) {
    var self = this;
    var dataStore = happyEdit.dataStore;
    var eventSystem = happyEdit.eventSystem;
    
    var defaults = {
        indentType: 'spaces',
        tabSize: '4'
    };
    
    self.id = Utils.count();
    self.$view = document.getElementById('settings');
    self.$indentType = self.$view.querySelector('select[name=indentType]');
    self.$tabSize = self.$view.querySelector('select[name=tabSize]');
    
    // Get the stored settings.
    self.data = dataStore.get('settings', {});
    self.data = Utils.extend(defaults, self.data);
    
    // Make sure dataStore has a reference to our data.
    dataStore.set('settings', self.data);
    
    // Update views with saved values.
    self.$indentType.value = self.data.indentType;
    self.$tabSize.value = self.data.tabSize;
    
    self.saveInput = function() {
        var name = this.name;
        var value = this.value;
        
        self.data[name] = value;
        
        eventSystem.callEventListeners('settings_changed', {
            name: name,
            value: value
        });
        
        dataStore.save();
    };
    
    self.$indentType.onchange = self.saveInput;
    self.$tabSize.onchange = self.saveInput;
    
    self.isDummy = function() {
        return false;
    };

    self.getTabLabel = function() {
        return 'Settings';
    };
    
    self.onChange = function(callback) {
    };
    
    self.blur = function() {
        happyEdit.popTabSpecificKeyboardHandler();
    };

    self.focus = function() {
        happyEdit.pushTabSpecificKeyboardHandler(self.keyDown);
    };
    
    self.keyDown = function(event) {
    };
}
