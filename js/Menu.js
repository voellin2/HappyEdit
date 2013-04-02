function Menu(happyEdit) {
    var self = this;

    self.$topButton = null;
    self.$popup = null;
    self.$blocker = null;
    
    self.$topButton = document.querySelector('#top .menu');
    self.$popup = document.querySelector('.popup.menu');
    self.$blocker = document.querySelector('.blocker.menu');

    var $fragment = document.createDocumentFragment();

    happyEdit.commands.each(function(command) {
        if (command.showInMenu) {
            var $li = HTML.createMenuOption({
                title: command.title,
                className: command.name,
                shortcut: Utils.getShortcutForCommand(command),
                callback: function() {
                    command.callback(null, function() {
                        self.hide();
                    });
                }
            });
            self.$popup.appendChild($li);
        }
    });

    self.$popup.appendChild($fragment);

    self.isVisible = function() {
        return this.$popup.style.display === 'block';
    };

    self.show = function() {
        Utils.addClass(self.$topButton, 'active');

        self.$blocker.onclick = function() {
            self.hide();
        };

        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            editor.blur();
        }, 100);
    };
    
    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        editor.focus();

        Utils.removeClass(self.$topButton, 'active');
    };
}
