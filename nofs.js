function NoFileSystemPopup(happyEdit) {
    var self = this;
    self.$popup = document.querySelector('.popup.nofs');
    self.$blocker = document.querySelector('.blocker.nofs');
    self.$connectButton = self.$popup.querySelector('.action.connect');
    self.$serverAddressField = self.$popup.querySelector('input[name=server]');

    self.isVisible = function() {
        return this.$popup.style.display === 'block';
    };

    self.$connectButton.onclick = function() {
        var addr = self.$serverAddressField.value;
        happyEdit.settings.set('remoteServer', addr, function() {
            happyEdit.fileSystem.load();
        });
    };

    happyEdit.eventSystem.addEventListener('connected', function() {
        if (self.isVisible()) {
            self.hide();
        }
    });

    self.show = function() {
        self.$blocker.onclick = function() {
            self.hide();
        };

        happyEdit.settings.get('remoteServer', function(value) {
            self.$serverAddressField.value = value;
        });

        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            happyEdit.editor.blur();
            happyEdit.setGlobalKeyboardHandler(self.globalKeyboardHandler);
        }, 100);
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
        happyEdit.setGlobalKeyboardHandler(null);
        happyEdit.editor.focus();
    };
}
