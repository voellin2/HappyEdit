/**
 * Wrapper around localstorage used when not running as a chrome packaged app
 */
var Storage = {
    get: function(key, defaultValue, callback) {
        if (window.localStorage) {
            if (key in window.localStorage) {
                callback(JSON.parse(window.localStorage[key]));
            } else {
                callback(defaultValue);
            }
        } else {
            console.log('localStorage is not available');
            callback(defaultValue);
        }
    },

    set: function(key, val, callback) {
        if (window.localStorage) {
            localStorage[key] = JSON.stringify(val);
        } else {
            console.log('localStorage is not available');
        }
    }
}
