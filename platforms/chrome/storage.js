/**
 * Wrapper around Chromes' storage API
 */
var Storage = {
    get: function(key, defaultValue, callback) {
        return chrome.storage.local.get(key, function(items) {
            if (items.hasOwnProperty(key)) {
                callback(items[key]);
            } else {
                callback(defaultValue);
            }
        });
    },

    set: function(key, val, callback) {
        var items = {};
        items[key] = val;

        // TODO research why inlining the items var in the following
        // function call does not work.

        chrome.storage.local.set(items, function() {
            if (callback) {
                callback();
            }
        });
    }
};
