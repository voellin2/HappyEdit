function SnippetPopup(happyEdit) {
    var self = this;
    self.$popup = document.querySelector('.popup.snippet');
    self.$blocker = document.querySelector('.blocker.snippet');
    self.$title = self.$popup.querySelector('.title');
    self.$backButton = self.$popup.querySelector('.actions .back');
    self.$useButton = self.$popup.querySelector('.actions .use');
    self.$textarea = self.$popup.querySelector('textarea');
    self.$answer = self.$popup.querySelector('.answer');
    self.snippet = null;

    self.$backButton.onclick = function() {
        self.hide();
        happyEdit.commandLine.show(null);
    };

    self.$useButton.onclick = function() {
        self.hide();
        var res = '';
        if (self.snippet.code) {
            res = self.snippet.code;
        } else {
            var tmpElem = document.createElement('div');
            tmpElem.innerHTML = self.snippet.answer;
            var codeElements = tmpElem.querySelectorAll('code');
            for (var i = 0; i < codeElements.length; i += 1) {
                res += codeElements[i].innerHTML + '\n\n';
            }
            window.res = res;
            res = res.replace(/&gt;/g, '>');
        }
        happyEdit.editor.insert(res);
    };

    self.$blocker.onclick = function() {
        self.hide();
    };

    self.showLoading = function(title) {
    };

    self.isVisible = function() {
        return this.$popup.style.display === 'block';
    };

    self.setSnippet = function(snippet) {
        self.$title.innerHTML = snippet.title;

        self.$textarea.style.display = 'none';
        self.$answer.style.display = 'none';

        if (snippet.code) {
            self.$textarea.innerHTML = snippet.code;
            self.$textarea.style.display = 'block';
        }

        if (snippet.answer) {
            self.$answer.innerHTML = snippet.answer;
            self.$answer.style.display = 'block';
        }

        self.snippet = snippet;
    };

    self.show = function() {
        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            happyEdit.editor.blur();
            happyEdit.setGlobalKeyboardHandler(self.globalKeyboardHandler);
        }, 100);
    };

    self.globalKeyboardHandler = function(event) {
        var keyCode = event.keyCode;
        switch (keyCode) {
            case 13:
            self.$useButton.onclick();
            break;

            case 27:
            self.$backButton.onclick();
            break;
        }
    };
    
    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        happyEdit.setGlobalKeyboardHandler(null);
        happyEdit.editor.focus();
    };
}
