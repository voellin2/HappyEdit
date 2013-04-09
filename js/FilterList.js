/**
 * List that provides auto complete/suggest functionality. It is specially
 * designed for file names, so that for example "main.js" will match
 * "scripts/main.js".
 */
function FilterList(data) {
    var self = this;
    self.data = data || [];
    self.trie = {};
    
    self.load = function(data) {
        self.data = data;
        self.index();
    };

    self.clear = function() {
        self.data = null;
        self.trie = {};
    };

    self.add = function(key, value) {
        var i;
        var partialKey = '';
        var hash = self.trie;

        for (i = 0; i < key.length; i += 1) {
            partialKey += key[i];

            if (!hash.hasOwnProperty(partialKey)) {
                hash[partialKey] = {};
            }

            hash = hash[partialKey];

            if (partialKey === key) {
                if (hash.hasOwnProperty('fullString')) {
                    hash.fullString.push(value);
                } else {
                    hash.fullString = [value];
                }
            }
        }
    };
    
    /**
     * Index an item that should have two keys: value and keys.
     */
    self.indexItem = function(item) {
        item.keys.forEach(function(key, i) {
            self.add(key, item.value);
        });
    };

    /**
     * (Re)indexes the source data array.
     */
    self.index = function() {
        self.data.forEach(function(item, i) {
            self.indexItem(item);
        });
    };
    
    /**
     * Returns a list of keys in a hash and its subhases.
     */
    self.getKeys = function(hash) {
        var ret = [];
        var key = '';
    
        for (key in hash) {
            if (hash.hasOwnProperty(key)) {
                if (typeof(hash[key]) === 'string') {
                    ret.push(hash[key]);
                } else {
                    ret = ret.concat(self.getKeys(hash[key]));
                }
            }
        }
    
        return ret;
    };
    
    /**
     * Returns a list of suggestions for a passed in input string.
     */
    self.getSuggestions = function(q) {
        var i;
        var key = '';
        var hash = self.trie;
        var ret = [];
        q = q.toLowerCase();

        for (i = 0; i < q.length; i += 1) {
            key += q[i];
            if (hash.hasOwnProperty(key)) {
                hash = hash[key];
                if (i === q.length - 1) {
                    ret = self.getKeys(hash);
                    break;
                }
            } else {
                break;
            }
        }

        ret.sort(function(a, b) {
            if (a.length < b.length) return -1;
            if (a.length > b.length) return 1;
            return 0;
        });

        // Filter dupes
        ret = ret.filter(function(v, i, a) {
            return a.indexOf(v) == i;
        });

        return ret;
    };
    
    self.index();
}

if (typeof window === 'undefined') {
    (function() {
        var assert = require('assert');
        var x = new FilterList();

        var data = [
            'server.py',
            'ace/server.py',
        ];

        var map = data.map(function(filename) {
            return {
                value: filename,
                keys: filename.toLowerCase().split('/')
            };
        });

        x.load(map);

        assert.equal(x.trie['s']['se']['ser']['serv']['serve']['server']['server.']['server.p']['server.py']['fullString'][0], 'server.py');

        var suggestions = x.getSuggestions('serv');
        assert.equal(suggestions.length, 2);
        assert.equal(suggestions[0], 'server.py');

        console.log('Tests OK');
    }());
}
