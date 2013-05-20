var PATH_SEPARATOR = '/';

function Buffer(happyEdit, filename, body) {
    var self = this;
    self.id = Utils.count();
    self.filename = null;
    self.displayPath = null;
    self.basename = null;
    self.dirname = null;
    self.doc = new CodeMirror.Doc(body, window.getMode(filename));
    self.onChangeListeners = [];

    self.isDummy = function() {
        return !self.filename && !self.getBody();
    };

    self.onChange = function(callback) {
        self.onChangeListeners.push(callback);
    };

    self.focus = function() {
        happyEdit.editor.setBuffer(self);
        happyEdit.editor.show();
        happyEdit.editor.focus();
    };

    self.blur = function() {
        happyEdit.editor.blur();
        happyEdit.editor.hide();
    };

    self.callOnChangeListeners = function() {
        var i;
        for (i = 0; i < self.onChangeListeners.length; i += 1) {
            self.onChangeListeners[i](self);
        }
    };

    self.getTabLabel = function() {
        return self.basename || 'Untitled';
    };

    self.rename = function(filename) {
        if (filename) {
            if (!Utils.startsWith(filename, '.' + PATH_SEPARATOR)) {
                filename = '.' + PATH_SEPARATOR + filename;
            }
            var split = filename.split(PATH_SEPARATOR);
            self.filename = filename;
            self.displayPath = filename;
            self.basename = split.pop();
            self.dirname = split.join(PATH_SEPARATOR);
        } else {
            self.filename = null;
            self.displayPath = null;
            self.basename = null;
            self.dirname = null;
        }

        self.callOnChangeListeners();
    };

    self.setBody = function(body) {
        self.doc.setValue(body);
    };

    self.getBody = function(body) {
        return self.doc.getValue();
    };
    
    self.rename(filename);
}
