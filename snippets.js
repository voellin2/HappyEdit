function SnippetsAPI(commandLine, snippetPopup) {
    var self = this;
    self.commandLine = commandLine;
    self.snippetPopup = snippetPopup;
    self.snippets = [];

    self.search = function(q, callback) {
        var url = 'http://snippets.happyedit.se/api/search?lang=python&q=' + encodeURIComponent(q);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                self.snippets = JSON.parse(xhr.responseText);
                callback(self.snippets);
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
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(function() {
                    self.search(q, function(snippets) {
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
                    });
                }, 500);
            } else {
                self.commandLine.clearSuggestions();
            }
        };
    }());
}
