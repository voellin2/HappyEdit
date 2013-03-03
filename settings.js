function Settings(happyEdit) {
    var self = this;
    self.$popup = null;
    self.$saveButton = null;
    self.$blocker = null;

    self.$popup = document.querySelector('.popup.settings');
    self.$blocker = document.querySelector('.blocker.settings');
    self.$saveButton = self.$popup.querySelector('input[type=submit]');

    self.defaults = {
        remoteServer: null,
    };

    self.$popup.querySelector('.cancel').addEventListener('click', function(event) {
        self.hide();
    });

    self.set = function(key, value, callback) {
        Storage.get('settings', self.defaults, function(settings) {
            settings[key] = value;
            Storage.set('settings', settings, function() {
                callback();
            });
        });
    };

    self.get = function(key, callback) {
        Storage.get('settings', self.defaults, function(settings) {
            var value = settings[key];
            callback(value);
        });
    };

    self.$saveButton.addEventListener('click', function(event) {
        self.save();
    });

    self.save = function() {
        var settings = self.defaults;
        var value;

        settings.remoteServer = self.$popup.querySelector('input.remote').value;

        Storage.set('settings', settings, function() {
            happyEdit.happyServer.load();
        });

        self.hide();
    };

    self.isVisible = function() {
        return this.$popup.style.display === 'block';
    };

    self.show = function() {
        self.$blocker.onclick = function() {
            self.hide();
        };

        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        Storage.get('settings', {}, function(data) {
            self.$popup.querySelector('input.remote').value = data.remoteServer || ''; 
        });

        happyEdit.editor.blur();
        happyEdit.pushGlobalKeyboardHandler(self.globalKeyboardHandler);
    };

    self.globalKeyboardHandler = function(event) {
        var keyCode = event.keyCode;
        if (keyCode === 27) {
            self.hide();
        }
    };
    
    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        happyEdit.popGlobalKeyboardHandler();
        happyEdit.editor.focus();
    };
}
