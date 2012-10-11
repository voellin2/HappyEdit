function HappyEdit() {
    var self = this;
    self.files = {};
    self.editor = ace.edit("editor");
    self.$editor = document.getElementById('editor');
    self.currentFile;
    self.commands = new CommandList(self);
    self.commandLine = new CommandLine(self);
    self.snippetPopup = new SnippetPopup(self);
    self.snippets = new SnippetsAPI(self.commandLine, self.snippetPopup);
    self.settings = new Settings(self);
    self.menu = new Menu(self);
    self.topBar = new TopBar(self);
    self.projectFiles = new ProjectFiles();

    window.onresize = function(event) {
        var w = window.innerWidth;
        var h = window.innerHeight - document.querySelector('#top').offsetHeight;

        self.$editor.style.width = w + 'px';
        self.$editor.style.height = h + 'px';
    }
    window.onresize();

    window.onkeydown = function(event) {
        if (!self.commandLine.isVisible() && !self.settings.isVisible()) {
            self.editor.focus();
        }
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
                exec: command.callback
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
        self.editor.setSession(file.getSession());

        if (updateTabs || updateTabs === undefined) {
            self.topBar.updateView(file);
        }
    }

    self.getNumberOfOpenFiles = function() {
        return self.topBar.tabs.length;
    }

    self.closeFile = function(file) {
        if (getNumberOfOpenFiles() > 1) {
            var tab = self.topBar.getTabForFile(file);
            tab.close(true);
            delete self.files[self.currentFile.name];
        } else {
            window.close();
        }
    }

    self.getOrLoadRemoteFile = function(filename, callback) {
        if (self.files.hasOwnProperty(filename)) {
            callback(self.files[filename]);
            return;
        }

        var xhr = new XMLHttpRequest();
        var url = self.projectFiles.host + '/files/' + filename;
        xhr.open("GET", url);
        xhr.onreadystatechange = function() {
            var file;
            if (xhr.readyState == 4) {
                file = new RemoteFile(filename, xhr.responseText);
                self.files[filename] = file;
                callback(file);
            }
        };
        xhr.send();
    }

    self.openRemoteFile = function(filename) {
        var file;

        self.getOrLoadRemoteFile(filename, function(file) {
            self.switchToFile(file);
        });
    }

    self.openLocalFile = function() {
        chrome.fileSystem.chooseEntry(function(fileEntry) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
                return;
            }
            fileEntry.file(function(f) {
                var reader = new FileReader();
                reader.onload = function() {
                    var file;
                    if (self.files.hasOwnProperty(fileEntry.name)) {
                        file = self.files[fileEntry.name];
                    } else {
                        file = new LocalFile(fileEntry, reader.result);
                        self.files[fileEntry.name] = file;
                    }
                    self.switchToFile(file);
                };
                reader.readAsText(f);
            });
        });
    }
}

window.onload = function() {
    window.happyEdit = new HappyEdit();
    window.happyEdit.snippets.showSnippet('123');
};

