function StackOverflow(happyEdit) {
    var self = this;
    self.commandLine = happyEdit.commandLine;
    self.snippetPopup = happyEdit.snippetPopup;
    self.titlesMap = {};

    self.search = function(q, lang, callback) {
        var url = "http://api.stackexchange.com/2.1/search/advanced?title=" + q + "&tagged=" + lang + "&accepted=true&site=stackoverflow";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var json = JSON.parse(xhr.responseText);
                var snippets = [];
                console.log('stackoverflow questions', json);

                for (var i = 0; i < json.items.length; i += 1) {
                    var question = json.items[i];
                    snippets.push({
                        accepted_answer_id: question.accepted_answer_id,
                        tags: question.tags,
                        title: question.title
                    });
                    self.titlesMap[question.accepted_answer_id] = question.title;
                }

                callback(json.items);
            }
        };

        xhr.send();
    };

    self.post = function(q, snippet) {
        throw "Not implemented yet";
    };

    self.loadSnippet = function(accepted_answer_id, callback) {
        var url = 'http://api.stackexchange.com/2.1/answers/' + accepted_answer_id + '?site=stackoverflow&filter=withbody';
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var json = JSON.parse(xhr.responseText);
                var text = json.items[0].body;
                console.log('stackoverflow answer', text);
                callback({
                    title: self.titlesMap[accepted_answer_id],
                    answer: text
                });
                callback(snippet);
            }
        };

        xhr.send();
    };

    self.snippetClickCallback = function() {
        var answerId = this.getAttribute('rel');
        self.showSnippet(answerId);
    };

    self.showSnippet = function(accepted_answer_id) {
        self.commandLine.hide();
        self.snippetPopup.show();
        self.loadSnippet(accepted_answer_id, function(snippet) {
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
                    //var lang = happyEdit.currentFile.getMode().name;
                    var lang = 'python';
                    self.search(q, lang, function(snippets) {
                        var i;
                        var suggestions = [];
                        for (i = 0; i < snippets.length; i += 1) {
                            var snippet = snippets[i];
                            suggestions.push({
                                title: snippet.title,
                                extra: snippet.tags.join(', '),
                                rel: snippet.accepted_answer_id,
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
