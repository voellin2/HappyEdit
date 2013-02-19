function HappyEdit() {
    var self = this;
    self.bufferCounter = 0;
    self.files = {};
    self.editor = ace.edit("editor");
    self.$editor = document.getElementById('editor');
    self.$explorers = document.getElementById('explorers');
    self.currentFile;
    self.eventSystem = new EventSystem();
    self.commands = new CommandList(self);
    self.commandLine = new CommandLine(self);
    self.nofsPopup = new NoFileSystemPopup(self);
    self.snippetPopup = new SnippetPopup(self);
    self.snippets = new SnippetsAPI(self);
    self.stackOverflow = new StackOverflow(self);
    self.settings = new Settings(self);
    self.menu = new Menu(self);
    self.topBar = new TopBar(self);
    self.bottomBar = new BottomBar(self);
    self.fileSystem = new RemoteFileSystem(self.eventSystem);
    self.globalKeyboardHandler = null;

    window.onresize = function(event) {
        var w = window.innerWidth;
        var h = window.innerHeight - document.querySelector('#top').offsetHeight - document.querySelector('#bottom').offsetHeight;

        self.$editor.style.width = w + 'px';
        self.$editor.style.height = h + 'px';

        self.$explorers.style.width = w + 'px';
        self.$explorers.style.height = h + 'px';
    };
    window.onresize();

    window.onkeydown = function(event) {
        if (self.globalKeyboardHandler) {
            self.globalKeyboardHandler(event);
        }
    };

    self.setGlobalKeyboardHandler = function(handler) {
        self.globalKeyboardHandler = handler;
    };

    self.editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    self.editor.setAnimatedScroll(true);

    self.commands.each(function(command) {
        if (command.shortcut) {
            self.editor.commands.addCommand({
                name: command.name,
                bindKey: {
                    win: command.shortcut.win,
                    mac: command.shortcut.mac,
                    sender: "editor"
                },
                exec: function() {
                    // We wrap this function call because Ace sends
                    // in the Editor object as the argument otherwise.
                    command.callback();
                }
            });
        }
    });

    for (var i = 1; i < 10; i += 1) {
        (function() {
            var keyNum = i;
            self.editor.commands.addCommand({
                name: "selectTab" + i,
                bindKey: {
                    win: "Ctrl-" + keyNum,
                    mac: "Command-" + keyNum,
                    sender: "editor"
                },
                exec: function() {
                    var tabIndex = keyNum;
                    if (tabIndex > self.topBar.tabs.length) {
                        tabIndex = self.topBar.tabs.length;
                    }
                    tabIndex -= 1;
                    self.topBar.selectTabAtIndex(tabIndex);
                }
            });
        }());
    }

    self.editor.getKeyboardHandler().actions[':'] = {
        fn: function(editor, range, count, param) {
            self.commandLine.show(":");
        }
    };

    self.editor.getKeyboardHandler().actions['/'] = {
        fn: function(editor, range, count, param) {
            self.commandLine.show("/");
        }
    };

    self.editor.getKeyboardHandler().actions['?'] = {
        fn: function(editor, range, count, param) {
            self.commandLine.show("?");
        }
    };

    self.switchToFile = function(file, updateTabs) {
        self.currentFile = file;

        if (file.constructor === Explorer) {
            file.show();
            self.$explorers.style.display = 'block';
            self.$editor.style.display = 'none';
            self.setGlobalKeyboardHandler(file.getGlobalKeyboardHandler());
        } else {
            self.editor.setSession(file.session);
            self.$explorers.style.display = 'none';
            self.$editor.style.display = 'block';
            self.setGlobalKeyboardHandler(null);
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
            delete self.files[self.currentFile.id];
        } else {
            window.close();
        }
    };

    self.getBufferByFilename = function(filename) {
        var key;
        var buffer;
        for (key in self.files) {
            if (self.files.hasOwnProperty(key)) {
                buffer = self.files[key];
                if (buffer.filename === filename) {
                    return buffer;
                }
            }
        }
    };

    /**
     * Creates a new buffer with given filename and body. If there's
     * an unnamed and available file, that will be used instead.
     */
    self.createNewBuffer = function(filename, body) {
        if (self.currentFile.constructor !== Explorer && !self.currentFile.filename && !self.currentFile.session.getValue()) {
            self.currentFile.rename(filename);
            self.currentFile.session.setValue(body);
            return self.currentFile;
        } else {
            var file = new Buffer(self.bufferCounter++, filename, body);
            self.files[file.id] = file;
            return file;
        }
    };

    self.getOrLoadRemoteFile = function(filename, callback) {
        var buffer = self.getBufferByFilename(filename);
        if (buffer) {
            callback(buffer);
            return;
        }

        var xhr = new XMLHttpRequest();
        var url = self.fileSystem.host + '/files/' + filename;
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            var file;
            if (xhr.readyState == 4) {
                file = self.createNewBuffer(filename, xhr.responseText);
                callback(file);
            }
        };
        xhr.send();
    };

    self.openRemoteFile = function(filename) {
        var file;

        self.getOrLoadRemoteFile(filename, function(file) {
            self.switchToFile(file);
        });
    };

    self.openFileExplorer = function() {
        var file = new Explorer(self);
        self.switchToFile(file);
    };

    self.openDummyBuffer = function() {
        var buffer = new Buffer(self.bufferCounter++, null, '');
        self.files[buffer.id] = buffer;
        self.switchToFile(buffer);
    };

    self.openDummyBuffer();
    self.fileSystem.load();
    self.editor.focus();
}

window.onload = function() {
    window.happyEdit = new HappyEdit();
    /*window.happyEdit.snippetPopup.show();
    window.happyEdit.snippetPopup.setSnippet({
        title: "Hello World",
        code: "import somestuff\n\nprint hello world\nprint 'ok'\nend"
    });*/
};
