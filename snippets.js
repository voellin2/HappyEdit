function SnippetsAPI(commandLine, snippetPopup) {
    var self = this;
    self.commandLine = commandLine;
    self.snippetPopup = snippetPopup;

    self.dummySnippets = [
        {
            title: 'How to read a file',
            id: '123',
            lang: 'python',
            tags: ['fs'],
            code: 'import os\n\nopen("filename")'
        },
        {
            title: 'How to open a socket connection',
            id: '234',
            lang: 'python',
            tags: ['io', 'networking'],
            code: 'import os\n\nopen("filename")'
        }
    ];

    self.search = function(q, callback) {
        console.log('searching for ' + q);
        callback(self.dummySnippets);
    };

    self.post = function(q, snippet) {
        throw "Not implemented yet";
    };

    self.loadSnippet = function(id, callback) {
        var i;
        var dummySnippet;
        for (i = 0; i < self.dummySnippets.length; i += 1) {
            dummySnippet = self.dummySnippets[i];
            if (dummySnippet.id === id) {
                callback(dummySnippet);
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

    self.fillCommandLineWithAutoCompletions = function(q) {
        self.search(q, function(snippets) {
            var i;
            var suggestions = [];
            for (i = 0; i < snippets.length; i += 1) {
                var snippet = snippets[i];
                suggestions.push({
                    title: snippet.title,
                    extra: snippet.lang + ' ' + snippet.tags.join(' '),
                    rel: snippet.id,
                    onclick: self.snippetClickCallback
                });
            }
            self.commandLine.fillSuggestionsList(suggestions);
        });
    };
}
