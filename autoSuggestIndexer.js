function AutoSuggestIndexer(happyEdit) {
    var self = this;
    
    self.data = {};
    
    happyEdit.eventSystem.addEventListener('file_loaded', function(buffer) {
        if (!self.data.hasOwnProperty(buffer.filename)) {
            self.index(buffer);
        }
    });
    
    /**
     * Regexp from https://gist.github.com/rnetocombr/3789861
     */
    self.index = function(buffer) {
        var possibleWords = buffer.body.match(/((?=\.)?\$?_?[A-Za-z_]{3,})/g);
        
        // Filter dupes
        possibleWords = possibleWords.filter(function(v, i, a) {
            return a.indexOf(v) == i;
        });
        
        self.data[buffer.filename] = possibleWords;
    };
    
    self.getWords = function() {
        var ret = [];
        var key;
        var words;
        
        for (key in self.data) {
            if (self.data.hasOwnProperty(key)) {
                words = self.data[key];
                ret = ret.concat(words);
            }
        }
        
        // Filter dupes
        ret = ret.filter(function(v, i, a) {
            return a.indexOf(v) == i;
        });
        
        return ret;
    };
}