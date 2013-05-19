/**
 * Based on:
 * 
 * https://github.com/cucumber/gherkin-editor/blob/master/public/js/gherkin-editor/autocomplete.js
 * https://github.com/ajaxorg/ace/blob/feature/codecomplete/lib/ace/autocomplete.js#L387
 * 
 * Ace GitHub issue regarding intellisense: https://github.com/ajaxorg/ace/issues/110
 */
function AutoCompleteBox(happyEdit) {
    var self = this;
    var editor = happyEdit.editor;
    var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
    
    self.$view = document.querySelector('#autocomplete');
    self.$ul = self.$view.querySelector('ul');
    self.list = new SelectableList();
    
    self.indexer = new AutoSuggestIndexer(happyEdit);
    
    self.commands = {
        "Ctrl-k": function(editor) { self.list.navigateUp(); },
        "Ctrl-j": function(editor) { self.list.navigateDown(); },
        "Ctrl-p": function(editor) { self.list.navigateUp(); },
        "Ctrl-n": function(editor) { self.list.navigateDown(); },
        "up": function(editor) { self.list.navigateUp(); },
        "down": function(editor) { self.list.navigateDown(); },
        "esc": function(editor) { self.hide(); },
        "space": function(editor) { self.hide(); editor.insert(" "); },
        "Return": function(editor) { self.insertMatch(); },
        "Tab": function(editor) { self.insertMatch(); }
    };
    
    self.keyboardHandler = new HashHandler();
    self.keyboardHandler.bindKeys(self.commands);
    
    self.insertMatch = function() {
        var text = self.list.getSelectedItem().model;
        self.hide();
        editor.removeWordLeft();
        editor.insert(text);
    };
    
    self.updatePosition = function() {
        var coords = editor.getCursorScreenCoordinates();
        var lineHeight = editor.getLineHeight();
        self.$view.style.top = coords.pageY + lineHeight + 'px';
        self.$view.style.left = coords.pageX + 'px';
    };
    
    self.blurListener = function() {
        self.hide();
    };
    
    self.mousedownListener = function() {
        self.hide();
    };

    self.changeSelectionListener = function() {
        self.hide();
    };
    
    self.attachKeyboardHandler = function() {
        editor.addKeyboardHandler(self.keyboardHandler);
        editor.on("changeSelection", self.changeSelectionListener);
        editor.on("blur", self.blurListener);
        editor.on("mousedown", self.mousedownListener);
    };
    
    self.detachKeyboardHandler = function() {
        editor.removeKeyboardHandler(self.keyboardHandler);
        editor.removeEventListener("changeSelectionListener", self.changeSelectionListener);
        editor.removeEventListener("blur", self.blurListener);
        editor.removeEventListener("mousedown", self.mousedownListener);
    };

    self.getMatches = function(word) {
        var ret = [];
        var data = self.indexer.getWords();
        data.forEach(function(item, i) {
            if (Utils.startsWith(item, word)) {
                ret.push(item);
            }
        });
        return ret;
    };
    
    self.populateList = function(matches) {
        self.$ul.innerHTML = '';
        self.list.clear();
        
        matches.forEach(function(match) {
            var model = match;
            var $view = HTML.createAutoCompleteItem(model);
            
            self.list.addItem({
                model: model,
                $view: $view
            });
            
            self.$ul.appendChild($view);
        });
    };
    
    self.show = function() {
        var word = editor.getWordAtLeft();
        var matches = self.getMatches(word);
        if (matches.length) {
            self.populateList(matches);
            self.updatePosition();
            self.attachKeyboardHandler();
            self.$view.style.display = 'block';
        }
    };
    
    self.hide = function() {
        self.detachKeyboardHandler();
        self.$view.style.display = 'none';
    };
}
