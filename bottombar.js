function BottomBar(happyEdit) {
    var self = this;

    self.$view = document.querySelector('#bottom');
    self.$indicator = self.$view.querySelector('.indicator');
    self.$indicatorText = self.$indicator.querySelector('.text');
    self.$langauge = self.$view.querySelector('.language');

    happyEdit.eventSystem.addEventListener('connected', function(host) {
        self.$indicatorText.innerHTML = 'Connected to ' + host;

        addClass(self.$indicator, 'connected');

        removeClass(self.$indicator, 'disconnected');
        removeClass(self.$indicator, 'connection-problem');
    });

    happyEdit.eventSystem.addEventListener('connection_problem', function(host) {
        self.$indicatorText.innerHTML = 'No connection to remote server: ' + host + '. Check settings.';

        addClass(self.$indicator, 'connection-problem');

        removeClass(self.$indicator, 'disconnected');
        removeClass(self.$indicator, 'connected');
    });

    happyEdit.eventSystem.addEventListener('disconnected', function(host) {
        self.$indicatorText.innerHTML = 'Not connected';

        addClass(self.$indicator, 'disconnected');

        removeClass(self.$indicator, 'connected');
        removeClass(self.$indicator, 'connection-problem');
    });

    happyEdit.eventSystem.addEventListener('file_changed', function(file) {
        self.$langauge.innerHTML = 'Mode: ' + file.getMode().name;
    });
}
