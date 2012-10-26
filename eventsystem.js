function EventSystem() {
    var self = this;

    self.listeners = {
        'connected': [],
        'connection_problem': [],
        'disconnected': []
    };

    self.addEventListener = function(type, fn) {
        if (self.listeners.hasOwnProperty(type)) {
            self.listeners[type].push(fn);
        } else {
            throw 'Unknown event type "' + type + '"';
        }
    };

    self.callEventListeners = function(type, data) {
        var i,
            fn,
            handlers = self.listeners[type];

        for (i = 0; i < handlers.length; i += 1) {
            fn = handlers[i];
            fn(data);
        }
    };
}
