function HappyEdit(dataStore) {
    var self = this;
    
    self.currentPane;
    self.openPanes = {};
    self.config = require('ace/config');
    
    self.dataStore = dataStore;
    self.eventSystem = new EventSystem();
    self.settings = new Settings(self);
    self.notifications = new Notifications(self);
    self.editor = new Editor(self);
    self.server = new Server(self);
    self.commands = new CommandList(self);
    self.commandLine = new CommandLine(self);
    self.autoCompleter = new AutoCompleteBox(self);
    self.topBar = new TopBar(self);
    self.fileSystem = new FileSystem(self.eventSystem);
    self.projectManager = new ProjectManager(self);
    self.tabState = new TabState(self);
    self.commandT = new CommandT(self.eventSystem, self.fileSystem);
    self.tabSpecificKeyboardHandlers = [];
    self.homeScreen = new HomeScreen(self);
    self.grepView = new GrepView(self);
    self.loginScreen = new LoginScreen(self);
    self.globalCommandManager = new GlobalCommandManager(self);
    self.dragAndDropHandler = new DragAndDropHandler(self);
    
    self.eventSystem.addEventListener('connected', function() {
        var $body = document.querySelector('body');
        Utils.addClass($body, 'connected');
        self.closePane(self.loginScreen, true);
        self.openHomeScreen();
    });
    
    self.eventSystem.addEventListener('disconnected', function() {
        var $body = document.querySelector('body');
        Utils.removeClass($body, 'connected');
        self.reset();
        self.closePane(self.homeScreen, true);
        self.showLoginScreen();
    });

    window.onresize = function(event) {
        var w = window.innerWidth;
        var h = window.innerHeight - self.topBar.$view.offsetHeight;
        var elems = document.querySelectorAll('.pane');
        var $pane;
        
        self.editor.resize(w, h);
        
        for (i = 0; i < elems.length; i += 1) {
            $pane = elems[i];
            $pane.style.width = w + 'px';
            $pane.style.height = h + 'px';
        }
        
        self.topBar.updateTabPositions();
        self.homeScreen.resize();
    };
    window.onresize();

    window.onkeydown = function(event) {
        if (self.commandLine.isVisible) {
            self.commandLine.$input.focus();
            return;
        }
        
        if (event.keyCode === 186 && event.shiftKey &&
            self.currentPane.constructor !== Buffer &&
            self.currentPane.constructor !== LoginScreen) {
                
            event.stopPropagation();
            event.preventDefault();
            self.commandLine.show();
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

    self.commands.each(function(command) {
        if (command.global) {
            self.globalCommandManager.addCommand(command);
        } else if (command.shortcut) {
            self.editor.addCommand(command);
        }
    });
    
    self.editor.bind(':', function() {
        self.commandLine.show();
    });

    self.editor.bind('/', function() {
        self.config.loadModule('ace/ext/searchbox', function(e) {
            e.Search(self.editor);
        });
    });

    self.editor.bind('?', function() {
        self.config.loadModule('ace/ext/searchbox', function(e) {
            e.Search(self.editor);
        });
    });
    
    self.switchPane = function(pane) {
        var oldPane = self.currentPane;
        var newPane = pane;
        
        self.currentPane = newPane;
        
        self.eventSystem.callEventListeners('pane_switched', {
            newPane: newPane,
            oldPane: oldPane
        });
        
        // Simplify / speed up switching if we swap between buffers
        if (oldPane && (oldPane.constructor === Buffer && newPane.constructor === Buffer)) {
            happyEdit.editor.setBuffer(newPane);
            self.topBar.selectTab(pane.tab);
            return;
        }
        
        if (oldPane) {
            oldPane.$view.style.display = 'none';
            oldPane.blur();
        }
        
        newPane.$view.style.display = 'block';
        newPane.focus();

        self.topBar.selectTab(pane.tab);
    };

    self.reset = function() {
        self.openPanes = {};
        self.openPanes[self.homeScreen.id] = self.homeScreen;
        self.topBar.reset();
    };
    
    /**
     * Remove the passed in pane from and close its tab. Set force=true to
     * force close sticky tabs.
     */
    self.closePane = function(pane, force) {
        if (pane.sticky === true && force !== true) {
            return;
        } 
        
        var tab = pane.tab;
        
        if (!tab) {
            return;
        }
        
        if (pane === self.currentPane && self.topBar.getNumberOfTabs() > 1) {
            var sibling = self.topBar.getClosestSibling(tab);
            self.topBar.selectTab(sibling);
        }

        self.topBar.closeTab(tab);

        delete self.openPanes[pane.id];
        
        self.eventSystem.callEventListeners('file_closed', pane);
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
        self.topBar.addTabForPane(buffer);
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

    self.openRemoteFile = function(filename, lineNumber, switchPane) {
        self.getOrLoadRemoteFile(filename, lineNumber, function(buffer) {
            if (switchPane !== false) {
                self.switchPane(buffer);
            }
            if (lineNumber) {
                self.editor.gotoLine(lineNumber);
            }
        });
    };

    self.openHomeScreen = function() {
        if (!self.openPanes.hasOwnProperty(self.homeScreen.id)) {
            self.openPanes[self.homeScreen.id] = self.homeScreen;
            self.topBar.addTabForPane(self.homeScreen);
        }
        self.switchPane(self.homeScreen);
    };

    self.showSettings = function() {
        if (!self.openPanes.hasOwnProperty(self.settings.id)) {
            self.openPanes[self.settings.id] = self.settings;
            self.topBar.addTabForPane(self.settings);
        }
        self.switchPane(self.settings);
    };

    self.showGrepResults = function(q) {
        if (!self.openPanes.hasOwnProperty(self.grepView.id)) {
            self.openPanes[self.grepView.id] = self.grepView;
            self.topBar.addTabForPane(self.grepView);
        }
        self.grepView.load(q);
        self.switchPane(self.grepView);
    };

    self.showLoginScreen = function() {
        if (!self.openPanes.hasOwnProperty(self.loginScreen.id)) {
            self.openPanes[self.loginScreen.id] = self.loginScreen;
            self.topBar.addTabForPane(self.loginScreen);
        }
        self.switchPane(self.loginScreen);
    };

    self.openDummyBuffer = function() {
        var buffer = self.createBuffer(null, '');
        self.switchPane(buffer);
    };
    
    self.exit = function() {
        window.close();
    };
    
    self.showLoginScreen();
    self.server.reconnect();
    self.editor.focus();
}

window.onload = function() {
    var dataStore = new DataStore();
    dataStore.load(function() {
        window.happyEdit = new HappyEdit(dataStore);
    });
};
