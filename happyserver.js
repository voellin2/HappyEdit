function HappyServer(eventSystem) {
    var self = this;
    self.host = null;

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

    Storage.get('settings', {}, function(data) {
        if (data.remoteServer) {
            self.load(data.remoteServer);
        }
    });
}
