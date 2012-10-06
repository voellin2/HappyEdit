var COMMANDS = [
    {
        name: "openFile",
        title: "Open Local File",
        shortcut: {
            win: "Ctrl-O",
            mac: "Command-O",
        },
        callback: function() {
            window.happyEdit.openLocalFile();
        }
    },
    {
        name: "commandT",
        title: "Open Remote File",
        shortcut: {
            win: "Ctrl-T",
            mac: "Command-T",
        },
        callback: function() {
            CommandLine.show('');
        }
    },
    {
        name: "save",
        title: "Save",
        shortcut: {
            win: "Ctrl-S",
            mac: "Command-S",
        },
        callback: function() {
            window.happyEdit.currentFile.save();
        }
    },
    {
        name: "nextTab",
        shortcut: {
            win: "Ctrl-Tab",
            mac: "Command-Shift-]",
        },
        callback: function() {
            TopBar.nextTab();
        }
    },
    {
        name: "prevTab",
        shortcut: {
            win: "Ctrl-Shift-Tab",
            mac: "Command-Shift-[",
        },
        callback: function() {
            TopBar.prevTab();
        }
    },
    {
        name: "closeFile",
        shortcut: {
            win: "Ctrl-W",
            mac: "Command-W",
        },
        callback: function() {
            window.happyEdit.closeFile(window.happyEdit.currentFile);
        }
    }
];

function HappyEdit() {
    var self = this;
    self.files = {};
    self.editor = ace.edit("editor");
    self.$editor = document.getElementById('editor');
    self.currentFile;

    CommandLine.init();
    Settings.init();
    Menu.init();
    TopBar.init();
    ProjectFiles.init();

    window.onresize = function(event) {
        var w = window.innerWidth;
        var h = window.innerHeight - document.querySelector('#top').offsetHeight;

        self.$editor.style.width = w + 'px';
        self.$editor.style.height = h + 'px';
    }
    window.onresize();

    window.onkeydown = function(event) {
        if (!CommandLine.isVisible() && !Settings.isVisible()) {
            self.editor.focus();
        }
    };

    self.editor.setKeyboardHandler(require("ace/keyboard/vim").handler);
    self.editor.setAnimatedScroll(true);

    for (var i = 0; i < COMMANDS.length; i += 1) {
        var command = COMMANDS[i];
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
                    if (tabIndex > TopBar.tabs.length) {
                        tabIndex = TopBar.tabs.length;
                    }
                    tabIndex -= 1;
                    TopBar.selectTabAtIndex(tabIndex);
                }
            });
        }());
    }

    self.editor.getKeyboardHandler().actions[':'] = {
        fn: function(editor, range, count, param) {
            CommandLine.show(":");
        }
    };

    self.editor.getKeyboardHandler().actions['/'] = {
        fn: function(editor, range, count, param) {
            CommandLine.show("/");
        }
    };

    self.editor.getKeyboardHandler().actions['?'] = {
        fn: function(editor, range, count, param) {
            CommandLine.show("?");
        }
    };

    self.switchToFile = function(file, updateTabs) {
        self.currentFile = file;
        self.editor.setSession(file.getSession());

        if (updateTabs || updateTabs === undefined) {
            TopBar.updateView(file);
        }
    }

    self.getNumberOfOpenFiles = function() {
        return TopBar.tabs.length;
    }

    self.closeFile = function(file) {
        if (getNumberOfOpenFiles() > 1) {
            var tab = TopBar.getTabForFile(file);
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
        var url = ProjectFiles.host + '/files/' + filename;
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
};

