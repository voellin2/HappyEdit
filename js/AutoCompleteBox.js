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
    
    self.index = 0;
    
    self.indexer = new AutoSuggestIndexer(happyEdit);
    
    self.matches = [];
    
    self.commands = {
        "Ctrl-k": function(editor) { self.navigateUp(); },
        "Ctrl-j": function(editor) { self.navigateDown(); },
        "Ctrl-p": function(editor) { self.navigateUp(); },
        "Ctrl-n": function(editor) { self.navigateDown(); },
        "up": function(editor) { self.navigateUp(); },
        "down": function(editor) { self.navigateDown(); },
        "esc": function(editor) { self.hide(); },
        "space": function(editor) { self.hide(); editor.insert(" "); },
        "Return": function(editor) { self.insertMatch(); },
        "Tab": function(editor) { self.insertMatch(); }
    };
    
    self.keyboardHandler = new HashHandler();
    self.keyboardHandler.bindKeys(self.commands);
    
    /**
     * From https://gist.github.com/rnetocombr/3789861
     */
    function getWordAtLeft() {
        var word;
        var range;
        var pos = editor.getCursorPosition();
        
        editor.selection.selectWordLeft();
        range = editor.selection.getRange();
        word = editor.session.getDocument().getTextRange(range);
        editor.selection.clearSelection();
        editor.moveCursorTo(pos.row, pos.column);

        return word || '';
    }
    
    self.insertMatch = function() {
        var text = self.getSelectedItem();
        self.hide();
        editor.removeWordLeft();
        editor.insert(text);
    };
    
    self.getSelectedItem = function() {
        return self.$ul.querySelector('.active').innerHTML;
    };
    
    self.selectIndex = function(index) {
        if (index < 0) {
            index = 0;
        } else if (index > self.matches.length - 1) {
            index = self.matches.length - 1;
        }
        
        self.index = index;
        
        var $old = self.$ul.querySelector('.active');
        var $new = self.$ul.querySelector('.item' + index);
        
        Utils.removeClass($old, 'active');
        Utils.addClass($new, 'active');
        
        $new.scrollIntoViewIfNeeded(false);
    };
    
    self.navigateUp = function() {
         self.selectIndex(self.index - 1);
    };
    
    self.navigateDown = function() {
         self.selectIndex(self.index + 1);
    };

    self.updatePosition = function() {
        var cursor = editor.getCursorPosition();
        var coords = editor.renderer.textToScreenCoordinates(cursor.row, cursor.column);
        var lineHeight = editor.renderer.layerConfig.lineHeight;

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
        editor.keyBinding.addKeyboardHandler(self.keyboardHandler);
        editor.on("changeSelection", self.changeSelectionListener);
        editor.on("blur", self.blurListener);
        editor.on("mousedown", self.mousedownListener);
    };
    
    self.detachKeyboardHandler = function() {
        editor.keyBinding.removeKeyboardHandler(self.keyboardHandler);
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
        HTML.fillAutoCompleteList(self.$ul, matches);
    };
    
    self.show = function() {
        var word = getWordAtLeft();
        self.matches = self.getMatches(word);
        if (self.matches.length) {
            self.populateList(self.matches);
            self.updatePosition();
            self.attachKeyboardHandler();
            self.selectIndex(0);
            self.$view.style.display = 'block';
        }
    };
    
    self.hide = function() {
        self.detachKeyboardHandler();
        self.$view.style.display = 'none';
    };
}
