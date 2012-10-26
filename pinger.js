/**
 * Pings the connected server and throws a connection_problem event if it does
 * not get a response.
 */
function Pinger(eventSystem) {
    var self = this;
    self.interval = null;

    eventSystem.addEventListener('connected', function(host) {
        var pingUrl = host + '/ping';

        self.interval = window.setInterval(function() {
            var xhr = new XMLHttpRequest();
            var url = host + '/ping';
            xhr.open("GET", url);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (!xhr.responseText) {
                        eventSystem.callEventListeners('connection_problem', host);
                        window.clearInterval(self.interval);
                    }
                }
            };
            xhr.send();
        }, 5000);
    });

    eventSystem.addEventListener('disconnected', function(host) {
        window.clearInterval(self.interval);
    });
}
