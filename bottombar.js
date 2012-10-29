function BottomBar(happyEdit) {
    var self = this;

    self.$view = document.querySelector('#bottom');
    self.$indicator = self.$view.querySelector('.indicator');
    self.$indicatorText = self.$view.querySelector('.text');

    happyEdit.eventSystem.addEventListener('connected', function(host) {
        self.$indicatorText.innerHTML = 'Connected to ' + host;

        addClass(self.$indicator, 'connected');

        removeClass(self.$indicator, 'disconnected');
        removeClass(self.$indicator, 'connection-problem');
    });

    happyEdit.eventSystem.addEventListener('connection_problem', function(host) {
        self.$indicatorText.innerHTML = 'Problem connecting to ' + host;

        addClass(self.$indicator, 'connection-problem');

        removeClass(self.$indicator, 'disconnected');
        removeClass(self.$indicator, 'connected');
    });

    happyEdit.eventSystem.addEventListener('disconnected', function(host) {
        self.$indicatorText.innerHTML = '';

        addClass(self.$indicator, 'disconnected');

        removeClass(self.$indicator, 'connected');
        removeClass(self.$indicator, 'connection-problem');
    });
}
