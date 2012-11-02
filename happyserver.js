function HappyServer(eventSystem) {
    var self = this;
    self.host = null;
    self.isConnected = false;

    /** Called when server settings is configured. **/
    self.load = function(host) {
        var xhr = new XMLHttpRequest();
        var url = host + '/info';

        self.host = host;
    
        xhr.open("GET", url);
    
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.responseText) {
                    var json = JSON.parse(xhr.responseText);
                    console.log('info ',  json);
                    eventSystem.callEventListeners('connected', host);
                } else {
                    eventSystem.callEventListeners('connection_problem', host);
                }
            }
        };
    
        xhr.send();
    };

    // If pinger notices a connection problem, we catch that.
    eventSystem.addEventListener('connection_problem', function(host) {
        self._isConnected = false;
    });
    eventSystem.addEventListener('connected', function(host) {
        self._isConnected = true;
    });

    self.isConnected = function() {
        return self._isConnected;
    };

    Storage.get('settings', {}, function(data) {
        if (data.remoteServer) {
            self.load(data.remoteServer);
        }
    });
}
