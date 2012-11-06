var EditSession = require('ace/edit_session').EditSession;
var UndoManager = require('ace/undomanager').UndoManager;
var PATH_SEPARATOR = '/';

function Buffer(id, filename, body) {
    var self = this;
    self.id = id;
    self.onChangeListeners = [];

    self.onChange = function(callback) {
        self.onChangeListeners.push(callback);
    };

    self.callOnChangeListeners = function() {
        var i;
        for (i = 0; i < self.onChangeListeners.length; i += 1) {
            self.onChangeListeners[i](self);
        }
    };

    self.getMode = function(filename) {
        var mode = window.modes[0];
        if (filename) {
            for (var i = 0; i < window.modes.length; i += 1) {
                if (modes[i].supportsFile(filename)) {
                    mode = modes[i];
                    break;
                }
            }
        }
        return mode.mode;
    }

    self.rename = function(filename) {
        if (filename) {
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

    self.session = new EditSession(body || '');
    self.session.setMode(self.getMode(filename));
    self.session.setUndoManager(new UndoManager());
    self.modified = false;
    self.rename(filename);

    self.session.getDocument().on('change', function(event) {
        self.modified = self.session.getUndoManager().$undoStack.length !== 0;
    });

    if (self.session.getMode().name === 'text') {
        self.session.setUseWrapMode(true);
    }
};
