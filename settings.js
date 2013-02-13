function Settings(happyEdit) {
    var self = this;
    self.$popup = null;
    self.$saveButton = null;
    self.$blocker = null;

    self.$popup = document.querySelector('.popup.settings');
    self.$blocker = document.querySelector('.blocker.settings');
    self.$saveButton = self.$popup.querySelector('input[type=submit]');

    self.defaults = {
        ignoredExtensions: [],
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

        var value = self.$popup.querySelector('input.ignored_extensions').value;
        var ignoredExtensions = [];
        value.split(',').forEach(function(ext, i) {
            if (ext.length) {
                if (ext[0] !== '.') {
                    ext = '.' + ext;
                }
                ignoredExtensions.push(ext);
            }
        });

        var value = self.$popup.querySelector('input.ignored_directories').value;
        var ignoredDirectories = [];
        value.split(',').forEach(function(ext, i) {
            if (ext.length) {
                ignoredDirectories.push(ext);
            }
        });

        settings.ignoredDirectories = ignoredDirectories;
        settings.ignoredExtensions = ignoredExtensions;
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
            if (data.ignoredExtensions) {
                self.$popup.querySelector('input.ignored_extensions').value = data.ignoredExtensions.join(',');
            } else {
                self.$popup.querySelector('input.ignored_extensions').value = '';
            }

            if (data.ignoredDirectories) {
                self.$popup.querySelector('input.ignored_directories').value = data.ignoredDirectories.join(',');
            } else {
                self.$popup.querySelector('input.ignored_directories').value = '';
            }

            self.$popup.querySelector('input.remote').value = data.remoteServer || ''; 
        });

        happyEdit.editor.blur();
        happyEdit.setGlobalKeyboardHandler(self.globalKeyboardHandler);
    };

    self.globalKeyboardHandler = function(event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 27:
            self.hide();
            break;
        }
    };
    
    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        happyEdit.setGlobalKeyboardHandler(null);
        happyEdit.editor.focus();
    };
};
