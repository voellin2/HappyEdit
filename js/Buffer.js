var EditSession = require('ace/edit_session').EditSession;
var UndoManager = require('ace/undomanager').UndoManager;
var PATH_SEPARATOR = '/';

function Buffer(happyEdit, filename, body) {
    var self = this;
    self.id = Utils.uuid();
    self.filename = null;
    self.displayPath = null;
    self.basename = null;
    self.dirname = null;
    self.session = new EditSession(body || '');
    self.session.setUndoManager(new UndoManager());
    self.onChangeListeners = [];

    self.isDummy = function() {
        return !self.filename && !self.session.getValue();
    };

    self.onChange = function(callback) {
        self.onChangeListeners.push(callback);
    };

    self.focus = function() {
        happyEdit.editor.setSession(self.session);
        happyEdit.editor.focus();
    };

    self.blur = function() {
        happyEdit.editor.blur();
    };

    self.callOnChangeListeners = function() {
        var i;
        for (i = 0; i < self.onChangeListeners.length; i += 1) {
            self.onChangeListeners[i](self);
        }
    };

    self.getMode = function() {
        var mode = window.modes[0];
        if (self.filename) {
            for (var i = 0; i < window.modes.length; i += 1) {
                if (modes[i].supportsFile(self.filename)) {
                    mode = modes[i];
                    break;
                }
            }
        }
        return mode.mode;
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
        self.session.setMode(self.getMode());

        if (self.session.getMode().name === 'text') {
            self.session.setUseWrapMode(true);
        } else {
            self.session.setUseWrapMode(false);
        }

        self.callOnChangeListeners();
    };

    self.setBody = function(body) {
        self.session.setValue(body);
    };

    self.getBody = function(body) {
        return self.session.getValue(body);
    };
    
    self.rename(filename);
}
