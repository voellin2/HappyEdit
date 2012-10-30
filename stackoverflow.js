function SnippetsAPI(happyEdit) {
    var self = this;
    self.commandLine = happyEdit.commandLine;
    self.snippetPopup = happyEdit.snippetPopup;

    self.search = function(q, lang, callback) {
        var url = "http://api.stackexchange.com/2.1/search/advanced?title=" + q + "&tagged=" + lang + "&accepted=true&site=stackoverflow";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var json = JSON.parse(xhr.responseText);
                console.log('stackoverflow response', json);
                callback(json);
            }
        };

        xhr.send();
    };

    self.post = function(q, snippet) {
        throw "Not implemented yet";
    };

    self.loadSnippet = function(id, callback) {
        var i;
        var snippet;
        for (i = 0; i < self.snippets.length; i += 1) {
            snippet = self.snippets[i];
            if (snippet.url === id) {
                callback(snippet);
            }
        }
    };

    self.snippetClickCallback = function() {
        var snippetId = this.getAttribute('rel');
        self.showSnippet(snippetId);
    };

    self.showSnippet = function(id) {
        self.commandLine.hide();
        self.snippetPopup.showLoading();
        self.snippetPopup.show();
        self.loadSnippet(id, function(snippet) {
            self.snippetPopup.setSnippet(snippet);
        });
    };

    (function() {
        var timer;
        self.fillCommandLineWithAutoCompletions = function(q) {
            if (q.length > 1) {
                self.commandLine.showLoading();
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    var lang = happyEdit.currentFile.getMode().name;
                    self.search(q, lang, function(snippets) {
                        var i;
                        var suggestions = [];
                        for (i = 0; i < snippets.length; i += 1) {
                            var snippet = snippets[i];
                            suggestions.push({
                                title: snippet.title,
                                extra: snippet.lang,
                                rel: snippet.url,
                                onclick: self.snippetClickCallback
                            });
                        }
                        self.commandLine.fillSuggestionsList(suggestions);
                        self.commandLine.hideLoading();
                    });
                }, 500);
            } else {
                self.commandLine.clearSuggestions();
            }
        };
    }());
}
