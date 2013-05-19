function EventSystem() {
    var self = this;

    self.listeners = {
        'project_switched': [],
        'projects_loaded': [],
        'tabs_swapped': [],
        'file_created': [],
        'file_changed': [],
        'file_loaded': [],
        'file_closed': [],
        'connected': [],
        'disconnected': [],
        'filesystem_loaded': []
    };

    self.addEventListener = function(type, fn) {
        if (self.listeners.hasOwnProperty(type)) {
            self.listeners[type].push(fn);
        } else {
            throw 'Unknown event type "' + type + '"';
        }
    };

    self.callEventListeners = function(type, data) {
        console.log(type, data);
        
        var i,
            fn,
            handlers = self.listeners[type];

        for (i = 0; i < handlers.length; i += 1) {
            fn = handlers[i];
            fn(data);
        }
    };
}
