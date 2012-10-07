function Settings(happyEdit) {
    var self = this;
    self.$popup = null;
    self.$saveButton = null;
    self.$blocker = null;

    self.$popup = document.querySelector('.popup.settings');
    self.$blocker = document.querySelector('.blocker.settings');
    self.$saveButton = self.$popup.querySelector('input[type=submit]');

    self.$popup.querySelector('.cancel').addEventListener('click', function(event) {
        self.hide();
    });

    self.$saveButton.addEventListener('click', function(event) {
        self.save();
    });

    self.save = function() {
        var settings = {
            ignoredExtensions: [],
            remoteServer: null,
        };

        var value = self.$popup.querySelector('input.ignored_extensions').value;
        var ignoredExtensions = [];
        value.split(',').forEach(function(ext, i) {
            if (ext.length) {
                if (ext[0] !== '.') {
                    ext = '.' + ext;
                }
                ignoredExtensions.push(ext)
            }
        });

        settings.ignoredExtensions = ignoredExtensions;
        settings.remoteServer = self.$popup.querySelector('input.remote').value;

        if (settings.remoteServer) {
            happyEdit.projectFiles.load(settings.remoteServer);
        }

        Storage.set('settings', settings);

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
            self.$popup.querySelector('input.remote').value = data.remoteServer || ''; 
        });

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            happyEdit.editor.blur();
        }, 100);
    };
    
    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        happyEdit.editor.focus();
    };
};
