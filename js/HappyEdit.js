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
    self.menu = new Menu(self);
    self.autoCompleter = new AutoCompleteBox(self);
    self.topBar = new TopBar(self);
    self.bottomBar = new BottomBar(self);
    self.fileSystem = new FileSystem(self.eventSystem);
    self.projectManager = new ProjectManager(self);
    self.tabState = new TabState(self);
    self.commandT = new CommandT(self.eventSystem, self.fileSystem);
    self.tabSpecificKeyboardHandlers = [];
    self.config = require('ace/config');
    self.explorer = new Explorer(self);
    self.grepView = new GrepView(self);
    self.globalCommandManager = new GlobalCommandManager(self);
    self.dragAndDropHandler = new DragAndDropHandler(self);

    window.onresize = function(event) {
        var w = window.innerWidth;
        var h = window.innerHeight - document.querySelector('#top').offsetHeight - document.querySelector('#bottom').offsetHeight;

        self.$editor.style.width = w + 'px';
        self.$editor.style.height = h + 'px';

        self.explorer.$view.style.width = w + 'px';
        self.explorer.$view.style.height = h + 'px';

        self.grepView.$view.style.width = w + 'px';
        self.grepView.$view.style.height = h + 'px';
        
        self.topBar.updateTabPositions();
    };
    window.onresize();

    window.onkeydown = function(event) {
        if (self.commandLine.isVisible) {
            self.commandLine.$input.focus();
            return;
        }
        var len = self.tabSpecificKeyboardHandlers.length;
        if (len) {
            self.tabSpecificKeyboardHandlers[len-1](event);
        }
    };

    self.pushTabSpecificKeyboardHandler = function(handler) {
        self.tabSpecificKeyboardHandlers.push(handler);
    };

    self.popTabSpecificKeyboardHandler = function() {
        self.tabSpecificKeyboardHandlers.pop();
    };

    self.editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    self.editor.setAnimatedScroll(true);

    self.commands.each(function(command) {
        if (command.global) {
            self.globalCommandManager.addCommand(command);
        } else if (command.shortcut) {
            self.editor.commands.addCommand({ name: command.name,
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

        if (updateTabs || updateTabs === undefined) {
            self.topBar.updateView(file);
        }

        self.eventSystem.callEventListeners('file_changed', file);
    };

    self.getNumberOfOpenFiles = function() {
        return self.topBar.tabs.length;
    };
    
    self.closeAllOpenFiles = function() {
        var file;
        var key;
        for (key in self.files) {
            if (self.files.hasOwnProperty(key)) {
                file = self.files[key];
                self.closeFile(file, true);
            }
        }
    };

    self.closeFile = function(file, keepAlive) {
        var tab = self.topBar.getTabForFile(file);

        // TODO investigate why a match could not be found.
        if (tab) {
            tab.close(true);
        }

        delete self.files[self.currentFile.id];
        
        self.eventSystem.callEventListeners('file_closed', file);
        
        if (self.getNumberOfOpenFiles() === 0 && keepAlive === false) {
            window.close();
        }
    };

    self.getBufferByFilename = function(filename) {
        var key;
        var buffer;
        for (key in self.files) {
            buffer = self.files[key];
            if (buffer.filename === filename) {
                return buffer;
            }
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
            var file = new Buffer(self, filename, body);
            self.files[file.id] = file;
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

    self.openRemoteFile = function(filename, lineNumber) {
        self.getOrLoadRemoteFile(filename, function(buffer) {
            self.switchToFile(buffer);
            if (lineNumber) {

                // Don't know why we need a timeout here...
                setTimeout(function() {
                    self.editor.gotoLine(lineNumber);
                }, 200);

            }
        });
    };

    self.openFileExplorer = function() {
        if (!self.files.hasOwnProperty(self.explorer.id)) {
            self.files[self.explorer.filename] = self.explorer;
        }
        self.switchToFile(self.explorer);
    };

    self.showGrepResults = function(q) {
        if (!self.files.hasOwnProperty(self.grepView.id)) {
            self.files[self.grepView.filename] = self.grep;
        }
        self.grepView.load(q);
        self.switchToFile(self.grepView);
    };

    self.openDummyBuffer = function() {
        var buffer = new Buffer(self, null, '');
        self.files[buffer.id] = buffer;
        self.switchToFile(buffer);
    };
    
    self.getSelection = function() {
        var range = self.editor.selection.getRange();
        var txt = self.editor.session.getDocument().getTextRange(range);
        return txt;
    };
    
    self.openDummyBuffer();

    var host = settings.get('currentProjectHost');
    if (host) {
        self.projectManager.loadProject(host);
    }
    
    self.editor.focus();
}

window.onload = function() {
    var settings = new Settings();
    settings.load(function() {
        window.happyEdit = new HappyEdit(settings);
    });
};
