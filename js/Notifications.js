function Notifications(happyEdit) {
    var self = this;
    self.$notification = document.querySelector('#notification');
    
    self.show = function(msg) {
        self.$notification.innerHTML = Utils.htmlEscape(msg);
        self.$notification.style.visibility = 'visible';
    };
    
    self.hide = function() {
        self.$notification.style.visibility = 'hidden';
    };
}