function Editor(happyEdit) {
    var self = this;
    
    self.ace = ace.edit("editor");
    self.$view = document.getElementById('editor');

    self.ace.setKeyboardHandler(require("ace/keyboard/vim").handler);
    self.ace.setAnimatedScroll(true);
    
    self.addCommand = function(command) {
        self.ace.commands.addCommand({
            name: command.name,
            bindKey: {
                win: command.shortcut.win,
                mac: command.shortcut.mac,
                sender: "editor"
            },
            exec: function(aceEditor) {
                // We wrap this function call because Ace sends
                // in the Editor object as the argument otherwise.
                command.callback(null, function(error) {
                    if (error) {
                        // TODO display error some way.
                        console.log('Error: ', error);
                    }
                });
            }
        });
    };
    
    self.bind = function(s, f) {
        self.ace.getKeyboardHandler().actions[s] = {
            fn: function(editor, range, count, param) {
                f();
            }
        };
    };
    
    self.getSelection = function() {
        var range = self.ace.selection.getRange();
        var txt = self.ace.session.getDocument().getTextRange(range);
        return txt;
    };

    self.show = function() {
        self.$view.style.display = 'block';
    };
    
    self.hide = function() {
        self.$view.style.display = 'none';
    };
    
    self.resize = function(w, h) {
        self.$view.style.width = w + 'px';
        self.$view.style.height = h + 'px';
    };
    
    /**
     * From https://gist.github.com/rnetocombr/3789861
     */
    self.getWordAtLeft = function() {
        var editor = self.ace;
        var word;
        var range;
        var pos = editor.getCursorPosition();
        
        editor.selection.selectWordLeft();
        range = editor.selection.getRange();
        word = editor.session.getDocument().getTextRange(range);
        editor.selection.clearSelection();
        editor.moveCursorTo(pos.row, pos.column);

        return word || '';
    };
    
    self.getCursorScreenCoordinates = function() {
        var cursor = self.ace.getCursorPosition();
        return self.ace.renderer.textToScreenCoordinates(cursor.row, cursor.column);
    };
    
    self.getLineHeight = function() {
        return self.ace.renderer.layerConfig.lineHeight;
    };
    
    // ACE WRAPPERS
    
    self.addKeyboardHandler = function(handler) {
        self.ace.keyBinding.addKeyboardHandler(handler);
    };
    
    self.removeKeyboardHandler = function(handler) {
        self.ace.keyBinding.removeKeyboardHandler(handler);
    };
    
    self.removeWordLeft = function() {
        self.ace.removeWordLeft();
    };
    
    self.insert = function(text) {
        self.ace.insert(text);
    };
    
    self.gotoLine = function(lineNumber) {
        self.ace.gotoLine(lineNumber);
    };
    
    self.setBuffer = function(buffer) {
        self.ace.setSession(buffer.session);
    };
    
    self.focus = function() {
        self.ace.focus();
    };
    
    self.blur = function() {
        self.ace.blur();
    };
    
    self.on = function(event, callback) {
        self.ace.on(event, callback);
    };
    
    self.removeEventListener = function(event, callback) {
        self.ace.removeEventListener(event, callback);
    };
    
    self.getCursorPosition = function(event, callback) {
        self.ace.on(event, callback);
    };
}