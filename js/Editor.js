function Editor(happyEdit) {
    var self = this;
    
    self.$editor = document.getElementById('editor');
    self.cm = CodeMirror(self.$editor, {
        lineNumbers: true,
        keyMap: "vim",
        showCursorWhenSelecting: true
    });
    
    self.cm.getWrapperElement().style["font-family"] = "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace";
    self.cm.getWrapperElement().style["line-height"] = "normal";
    self.cm.getWrapperElement().style["font-size"] = "12px";

    self.addCommand = function(command) {
    };
    
    self.bind = function(s, f) {
    };
    
    self.getSelection = function() {
        return '';
    };

    self.show = function() {
        self.$editor.style.display = 'block';
    };
    
    self.hide = function() {
        self.$editor.style.display = 'none';
    };
    
    self.resize = function(w, h) {
        self.cm.setSize(w, h);
    };
    
    self.setBuffer = function(buffer) {
        self.cm.swapDoc(buffer.doc);
    };
    
    self.removeWordLeft = function() {
    };
    
    self.insert = function(text) {
    };
    
    self.gotoLine = function(lineNumber) {
    };
    
    self.focus = function() {
        self.cm.focus();
        self.cm.refresh();
    };
    
    self.blur = function() {
    };
    
    self.getCursorPosition = function() {
    };
}
