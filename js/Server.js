function Server(happyEdit) {
    var self = this;

    self.host = null;
    self.authToken = null;

    var dataStore = happyEdit.dataStore;
    var eventSystem = happyEdit.eventSystem;

    self.reconnect = function() {
        var server = dataStore.get('server');
        
        if (server && server.host) {
            self.host = server.host;
            self.authToken = server.authToken;
            eventSystem.callEventListeners('connected', self);
        }
    };
    
    self.connect = function(host, user, password, callback) {
        if (host.split(':')[0] !== 'http') {
            host = 'http://' + host;
        }

        var xhr = new XMLHttpRequest();
        var url = host + '/login';
        var params = 'user=' + encodeURIComponent(user) + '&password=' + encodeURIComponent(password);

        xhr.open("POST", url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.onload = function() {
            if (xhr.status !== 200) {
                callback(xhr.responseText || 'Unknown error');
                return;
            }
            
            var json = JSON.parse(xhr.responseText);
            
            self.host = host;
            self.authToken = json.authToken;
            
            eventSystem.callEventListeners('connected', self);
            dataStore.set('server', self.toJSON());
            dataStore.save();
            
            callback();
        };

        xhr.onerror = function()  {
            callback(xhr.responseText || 'Unknown error');
        };

        xhr.send(params);
    };
    
    self.isConnected = function() {
        return self.host !== null;
    };
    
    self.disconnect = function() {
        if (!self.isConnected()) {
            return;
        }
        
        self.host = null;
        self.authToken = null;
        
        dataStore.set('server', self.toJSON());
        dataStore.save();
        
        eventSystem.callEventListeners('disconnected');
    };
    
    self.toJSON = function() {
        return {
            host: self.host,
            authToken: self.authToken
        };
    };
}
