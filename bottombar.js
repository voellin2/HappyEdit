function BottomBar(happyEdit) {
    var self = this;

    self.$view = document.querySelector('#bottom');
    self.$indicator = self.$view.querySelector('.indicator');
    self.$indicatorText = self.$indicator.querySelector('.text');
    self.$langauge = self.$view.querySelector('.language');
    self.$status = self.$view.querySelector('.status');

    self.$indicator.onclick = function() {
        if (hasClass(this, 'disconnected') || hasClass(this, 'connection-problem')) {
            happyEdit.nofsPopup.show();
        }
    };

	happyEdit.editor.on("changeStatus", function() {
        if (happyEdit.editor.$vimModeHandler) {
			self.$status.innerHTML = happyEdit.editor.$vimModeHandler.getStatusText();
        }/* else if (editor.commands.recording) {
			self.$status = "REC";
        }*/
	});    

    happyEdit.eventSystem.addEventListener('connected', function(host) {
        self.$indicatorText.innerHTML = 'Connected to ' + host;

        addClass(self.$indicator, 'connected');

        removeClass(self.$indicator, 'disconnected');
        removeClass(self.$indicator, 'connection-problem');
    });

    happyEdit.eventSystem.addEventListener('connection_problem', function(host) {
        self.$indicatorText.innerHTML = 'Disconnected';

        addClass(self.$indicator, 'connection-problem');

        removeClass(self.$indicator, 'disconnected');
        removeClass(self.$indicator, 'connected');
    });

    happyEdit.eventSystem.addEventListener('file_changed', function(file) {
        self.$langauge.innerHTML = 'Mode: ' + file.getMode().name;
    });
}
