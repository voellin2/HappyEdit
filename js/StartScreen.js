function StartScreen(happyEdit) {
    var self = this;
    self.$view = document.querySelector('#start');
    self.$projects = self.$view.querySelector('.projects');
    self.$connectButton = self.$view.querySelector('.connect-button');
    self.id = Utils.count();
    
    self.$connectButton.onclick = function(event) {
        var host = self.$view.querySelector('input[name=host]').value;
        var user = self.$view.querySelector('input[name=user]').value;
        var password = self.$view.querySelector('input[name=password]').value;
        
        if (!host) {
            happyEdit.notifications.show('A host must be provided.');
            return;
        }
        
        if (!user) {
            happyEdit.notifications.show('A user must be provided.');
            return;
        }
        
        if (!password) {
            happyEdit.notifications.show('A password must be provided.');
            return;
        }
        
        happyEdit.server.login(host, user, password, function(error) {
            if (error) {
                happyEdit.notifications.show(error);
            } else {
                happyEdit.notifications.hide();
            }
        });
        
        event.stopPropagation();
        event.preventDefault();
    };
    
    var eventSystem = happyEdit.eventSystem;
    
    eventSystem.addEventListener('disconnected', function() {
    });

    self.keyDown = function(event) {
    };
    
    self.getTabLabel = function() {
        return 'Start';
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
}
