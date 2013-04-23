function BottomBar(happyEdit) {
    var self = this;

    self.$view = document.querySelector('#bottom');
    self.$indicator = self.$view.querySelector('.indicator');
    self.$indicatorText = self.$indicator.querySelector('.text');
    self.$langauge = self.$view.querySelector('.language');
    self.$status = self.$view.querySelector('.status');

    self.$indicator.onclick = function() {
        if (Utils.hasClass(this, 'disconnected')) {
            // TODO: show command prompt with :command option?
        }
    };

	happyEdit.editor.on("changeStatus", function() {
        if (happyEdit.editor.$vimModeHandler) {
			self.$status.innerHTML = happyEdit.editor.$vimModeHandler.getStatusText();
        }/* else if (editor.commands.recording) {
			self.$status = "REC";
        }*/
	});    
    
    happyEdit.eventSystem.addEventListener('connected', function(server) {
        self.$indicatorText.innerHTML = 'Connected: ' + server.host;
        Utils.addClass(self.$indicator, 'connected');
        Utils.removeClass(self.$indicator, 'disconnected');
    });

    happyEdit.eventSystem.addEventListener('project_switched', function(project) {
        self.$indicatorText.innerHTML = 'Connected: ' + project.title;
    });

    happyEdit.eventSystem.addEventListener('disconnected', function() {
        self.$indicatorText.innerHTML = 'Disconnected';
        Utils.addClass(self.$indicator, 'disconnected');
        Utils.removeClass(self.$indicator, 'connected');
    });

    happyEdit.eventSystem.addEventListener('file_changed', function(file) {
        if (file.getMode) {
            self.$langauge.innerHTML = 'Mode: ' + file.getMode().name;
        } else {
            self.$langauge.innerHTML = '';
        }
    });
}
