/**
 * List that provides auto complete/suggest functionality.
 */
function AutoSuggestList(data) {
    var self = this;
    self.data = data;
    self.trie = {};
    self.data = data;
    
    /**
     * Indexes the passed in string.
     */
    self._makeAutoSuggestable = function(s) {
        var i = 0;
        var key = '';
        var hash = self.trie;
        var sLowerCase = s.toLowerCase();

        for (i = 0; i < sLowerCase.length; i += 1) {
            key += sLowerCase[i];
            if (!hash.hasOwnProperty(key)) {
                hash[key] = {};
            }
            hash = hash[key];

            if (i === sLowerCase.length - 1) {
                hash.fullString = s;
            }
        }
    };
    
    /**
     * (Re)indexes the source data array.
     */
    self.index = function() {
        var i;
        var s;
        for (i = 0; i < self.data.length; i += 1) {
            s = self.data[i];
            self._makeAutoSuggestable(s);
        }
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

        return ret;
    };

    self.index();
}

if (typeof window === 'undefined') {
    (function() {
        var assert = require('assert');
        var x = new AutoSuggestList(['tabnew', 'tabnext', 'tabprevious']);

        var suggestions = x.getSuggestions('tabne');
        assert.equal(suggestions.length, 2);
        assert.equal(suggestions[0], 'tabnew');

        suggestions = x.getSuggestions('tabp');
        assert.equal(suggestions.length, 1);
        assert.equal(suggestions[0], 'tabprevious');

        console.log('Tests OK');
    }());
}
