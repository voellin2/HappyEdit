function SnippetPopup(happyEdit) {
    var self = this;
    self.$popup = document.querySelector('.popup.snippet');
    self.$blocker = document.querySelector('.blocker.snippet');
    self.$title = self.$popup.querySelector('.title');
    self.$backButton = self.$popup.querySelector('.actions .back');
    self.$useButton = self.$popup.querySelector('.actions .use');
    self.$textarea = self.$popup.querySelector('textarea');

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
        self.$textarea.innerHTML = snippet.code;
    };

    self.show = function() {
        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            happyEdit.editor.blur();
        }, 100);
    };
    
    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        happyEdit.editor.focus();
    };
};
