var EditSession = require('ace/edit_session').EditSession;
var UndoManager = require('ace/undomanager').UndoManager;
var PATH_SEPARATOR = '/';

function Buffer(filename, body) {
    var self = this;
    var split = filename.split(PATH_SEPARATOR);

    self.getMode = function(filename) {
        var mode = window.modes[0];
        for (var i = 0; i < window.modes.length; i += 1) {
            if (modes[i].supportsFile(name)) {
                mode = modes[i];
                break;
            }
        }
        return mode.mode;
    }

    self.displayPath = filename;
    self.basename = split.pop();
    self.dirname = split.join(PATH_SEPARATOR);
    self.session = new EditSession(body || '');
    self.session.setMode(self.getMode(name));
    self.session.setUndoManager(new UndoManager());
    self.modified = false;

    self.session.getDocument().on('change', function(event) {
        self.modified = self.session.getUndoManager().$undoStack.length !== 0;
    });

    if (self.session.getMode().name === 'text') {
        self.session.setUseWrapMode(true);
    }
};
