function HappyEdit(settings) {
    var self = this;
    self.settings = settings;
    self.files = {};
    self.editor = ace.edit("editor");
    self.$editor = document.getElementById('editor');
    self.currentFile;
    self.eventSystem = new EventSystem();
    self.commands = new CommandList(self);
    self.commandLine = new CommandLine(self);
    self.snippetPopup = new SnippetPopup(self);
    self.snippets = new SnippetsAPI(self);
    self.stackOverflow = new StackOverflow(self);
    self.menu = new Menu(self);
    self.topBar = new TopBar(self);
    self.bottomBar = new BottomBar(self);
    self.fileSystem = new RemoteFileSystem(self.eventSystem, self.settings);
    self.globalKeyboardHandlers = [];
    self.config = require('ace/config');
    self.explorer = new Explorer(self);
    self.globalCommandManager = new GlobalCommandManager(self);

    window.onresize = function(event) {
        var w = window.innerWidth;
        var h = window.innerHeight - document.querySelector('#top').offsetHeight - document.querySelector('#bottom').offsetHeight;

        self.$editor.style.width = w + 'px';
        self.$editor.style.height = h + 'px';

        self.explorer.$view.style.width = w + 'px';
        self.explorer.$view.style.height = h + 'px';
    };
    window.onresize();

    window.onkeydown = function(event) {
        var len = self.globalKeyboardHandlers.length;
        if (len) {
            self.globalKeyboardHandlers[len-1](event);
        }
    };

    self.pushGlobalKeyboardHandler = function(handler) {
        self.globalKeyboardHandlers.push(handler);
    };

    self.popGlobalKeyboardHandler = function() {
        self.globalKeyboardHandlers.pop();
    };

    self.editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    self.editor.setAnimatedScroll(true);

    self.commands.each(function(command) {
        if (command.global) {
            self.globalCommandManager.addCommand(command);
        } else if (command.shortcut) {
            self.editor.commands.addCommand({
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
        }
    });

    self.editor.getKeyboardHandler().actions[':'] = {
        fn: function(editor, range, count, param) {
            self.commandLine.show('');
        }
    };

    self.editor.getKeyboardHandler().actions['/'] = {
        fn: function(editor, range, count, param) {
            self.config.loadModule('ace/ext/searchbox', function(e) {
                e.Search(self.editor);
            });
        }
    };

    self.editor.getKeyboardHandler().actions['?'] = {
        fn: function(editor, range, count, param) {
            self.config.loadModule('ace/ext/searchbox', function(e) {
                e.Search(self.editor);
            });
        }
    };

    self.switchToFile = function(file, updateTabs) {
        if (self.currentFile) {
            self.currentFile.blur();
        }
        self.currentFile = file;
        self.currentFile.focus();

        // If Buffer had a reference to self, it could do this in its blur().
        if (self.currentFile.constructor === Buffer) {
            self.editor.setSession(self.currentFile.session);
            self.editor.focus();
        }

        if (updateTabs || updateTabs === undefined) {
            self.topBar.updateView(file);
        }

        self.eventSystem.callEventListeners('file_changed', file);
    };

    self.getNumberOfOpenFiles = function() {
        return self.topBar.tabs.length;
    };

    self.closeFile = function(file) {
        if (self.getNumberOfOpenFiles() > 1) {
            var tab = self.topBar.getTabForFile(file);
            tab.close(true);
            delete self.files[self.currentFile.filename];
        } else {
            window.close();
        }
    };

    self.getBufferByFilename = function(filename) {
        if (self.files.hasOwnProperty(filename)) {
            return self.files[filename];
        }
    };

    /**
     * Creates a new buffer with given filename and body. If there's
     * an unnamed and available file, that will be used instead.
     */
    self.createNewBuffer = function(filename, body) {
        if (self.currentFile.isDummy()) {
            self.currentFile.rename(filename);
            self.currentFile.setBody(body);
            return self.currentFile;
        } else {
            var file = new Buffer(filename, body);
            self.files[file.filename] = file;
            return file;
        }
    };

    self.getOrLoadRemoteFile = function(filename, callback) {
        var buffer = self.getBufferByFilename(filename);

        if (buffer) {
            callback(buffer);
            return;
        } else {
            buffer = self.createNewBuffer(filename, '');
        }

        callback(buffer);

        self.fileSystem.getFile(filename, function(body) {
            buffer.setBody(body);
        });
    };

    self.openRemoteFile = function(filename) {
        self.getOrLoadRemoteFile(filename, function(buffer) {
            self.switchToFile(buffer);
        });
    };

    self.openFileExplorer = function() {
        self.switchToFile(self.explorer);
    };

    self.openDummyBuffer = function() {
        var buffer = new Buffer(null, '');
        self.files[buffer.id] = buffer;
        self.switchToFile(buffer);
    };

    self.openDummyBuffer();
    self.fileSystem.load();
    self.editor.focus();
}

window.onload = function() {
    var settings = new Settings();
    settings.load(function() {
        window.happyEdit = new HappyEdit(settings);
    });
};
