function Settings() {
    var self = this;

    self.defaults = {
        currentProjectHost: null,
        projects: []
    };

    self.data = Utils.extend({}, self.defaults);

    self.set = function(key, value) {
        self.data[key] = value;
    };

    self.get = function(key, defaultValue) {
        if (self.data.hasOwnProperty(key)) {
            return self.data[key];
        }
        return defaultValue;
    };

    self.load = function(callback) {
        Storage.get('settings', self.defaults, function(data) {
            self.data = data;
            if (callback) {
                callback(self);
            }
        });
    };

    self.save = function(callback) {
        Storage.set('settings', self.data, function() {
            if (callback) {
                callback(self);
            }
        });
    };
}
