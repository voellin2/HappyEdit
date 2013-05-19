function LoginScreen(happyEdit) {
    var self = this;
    var eventSystem = happyEdit.eventSystem;
    
    self.sticky = true;
    self.$view = document.querySelector('#login');
    self.$button = self.$view.querySelector('.connect-button');
    self.id = Utils.count();
    
    self.$host = self.$view.querySelector('input[name=host]');
    self.$user = self.$view.querySelector('input[name=user]');
    self.$password = self.$view.querySelector('input[name=password]');
    
    self.$button.onclick = function(event) {
        var host = self.$host.value;
        var user = self.$user.value;
        var password = self.$password.value;
        
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
    
    eventSystem.addEventListener('disconnected', function() {
        self.reset();
    });
    
    self.reset = function() {
        self.$host.value = '';
        self.$user.value = '';
        self.$password.value = '';
    };

    self.keyDown = function(event) {
    };
    
    self.getTabLabel = function() {
        return 'Login';
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
        self.$host.focus();
    };
}
