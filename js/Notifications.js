function Notifications(happyEdit) {
    var self = this;
    var timeout;
    self.$notification = document.querySelector('#notification');
    
    self.show = function(msg) {
        self.$notification.innerHTML = Utils.htmlEscape(msg);
        self.$notification.style.opacity = '0.8';
    };
    
    self.hide = function() {
        self.$notification.style.opacity = '0';
    };
    
    self.flash = function(msg) {
        if (self.timeout) {
            clearTimeout(self.timeout);
        }
        
        self.show(msg);
        
        self.timeout = setTimeout(function() {
            self.hide();
            self.timeout = false;
        }, 1000);
    };
    
    happyEdit.eventSystem.addEventListener('pane_switched', function(args) {
        var newPane = args.newPane;
        var buffer;
        if (args.newPane.constructor === Buffer) {
            buffer = args.newPane;
            self.flash(buffer.displayPath);
        }
    });
    
    happyEdit.eventSystem.addEventListener('file_saved', function(buffer) {
        self.flash('File Saved');
    });
}