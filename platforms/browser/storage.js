/**
 * Wrapper around localstorage used when not running as a chrome packaged app
 */
var Storage = {
    get: function(key, defaultValue, callback) {
        if (key in window.localStorage) {
            callback(JSON.parse(window.localStorage[key]));
        } else {
            callback(defaultValue);
        }
    },

    set: function(key, val, callback) {
        localStorage[key] = JSON.stringify(val);
        callback();
    }
}
