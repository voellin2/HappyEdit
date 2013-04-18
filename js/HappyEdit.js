function HappyEdit(dataStore) {
    var self = this;
    
    self.currentPane;
    self.openPanes = {};
    self.editor = ace.edit("editor");
    self.$editor = document.getElementById('editor');
    self.config = require('ace/config');
    
    self.dataStore = dataStore;
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
    self.explorer = new Explorer(self);
    self.grepView = new GrepView(self);
    self.startScreen = new StartScreen(self);
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
            self.commandLine.show();
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

    self.switchPane = function(pane, updateTabs) {
        if (self.currentPane) {
            self.currentPane.blur();
        }

        self.currentPane = pane;
        self.currentPane.focus();

        if (updateTabs || updateTabs === undefined) {
            self.topBar.updateView(pane);
        }

        self.eventSystem.callEventListeners('file_changed', pane);
    };

    self.getNumberOfOpenPanes = function() {
        return self.topBar.tabs.length;
    };
    
    self.reset = function() {
        self.openPanes = {};
        self.topBar.reset();
    };
    
    self.closePane = function(pane, keepAlive) {
        var tab = self.topBar.getTabForPane(pane);

        tab.close(true);

        delete self.openPanes[pane.id];
        
        self.eventSystem.callEventListeners('file_closed', pane);
        
        if (self.getNumberOfOpenPanes () === 0 && keepAlive === false) {
            window.close();
        }
    };

    self.getPaneById = function(id) {
        if (self.openPanes.hasOwnProperty(id)) {
            return self.openPanes[id];
        }
    };

    self.getBufferByFilename = function(filename) {
        var key;
        var buffer;
        
        for (key in self.openPanes) {
            if (!self.openPanes.hasOwnProperty(key)) {
                return;
            }
            
            buffer = self.openPanes[key];
            
            if (buffer.constructor === Buffer && buffer.filename === filename) {
                return buffer;
            }
        }
    };

    /**
     * Creates a new buffer with given filename and body. If there's
     * an unnamed and available file, that will be used instead.
     */
    self.createBuffer = function(filename, body) {
        var buffer = new Buffer(self, filename, body);
        self.openPanes[buffer.id] = buffer;
        return buffer;
    };

    self.getOrLoadRemoteFile = function(filename, lineNumber, callback) {
        var buffer = self.getBufferByFilename(filename);

        if (buffer) {
            callback(buffer);
            return;
        }
        
        buffer = self.createBuffer(filename, '');

        callback(buffer);

        self.fileSystem.getFile(filename, function(body) {
            buffer.setBody(body);
            if (lineNumber) {
                self.editor.gotoLine(lineNumber);
            }
        });
    };

    self.openRemoteFile = function(filename, lineNumber) {
        self.getOrLoadRemoteFile(filename, lineNumber, function(buffer) {
            self.switchPane(buffer);
            if (lineNumber) {
                self.editor.gotoLine(lineNumber);
            }
        });
    };

    self.openFileExplorer = function() {
        if (!self.openPanes.hasOwnProperty(self.explorer.id)) {
            self.openPanes[self.explorer.id] = self.explorer;
        }
        self.switchPane(self.explorer);
    };

    self.showGrepResults = function(q) {
        if (!self.openPanes.hasOwnProperty(self.grepView.id)) {
            self.openPanes[self.grepView.id] = self.grepView;
        }
        self.grepView.load(q);
        self.switchPane(self.grepView);
    };

    self.showStartScreen = function(q) {
        if (!self.openPanes.hasOwnProperty(self.startScreen.id)) {
            self.openPanes[self.startScreen.id] = self.startScreen;
        }
        self.switchPane(self.startScreen);
    };

    self.openDummyBuffer = function() {
        var buffer = self.createBuffer(null, '');
        self.switchPane(buffer);
    };
    
    self.getSelection = function() {
        var range = self.editor.selection.getRange();
        var txt = self.editor.session.getDocument().getTextRange(range);
        return txt;
    };
    
    self.openDummyBuffer();

    var host = dataStore.get('currentProjectHost');
    if (host) {
        self.projectManager.loadProject(host);
    }
    
    self.editor.focus();
}

window.onload = function() {
    var dataStore = new DataStore();
    dataStore.load(function() {
        window.happyEdit = new HappyEdit(dataStore);
    });
};
