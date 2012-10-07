function CommandList(happyEdit) {
    var self = this;
    self._commands = [
        {
            name: "quit",
            hideCommandLine: true,
            callback: function(args) {
                happyEdit.closeFile(happyEdit.currentFile);
            }
        },
        {
            name: "e",
            hideCommandLine: true,
            callback: function(args) {
                var filename = args.join(' ');
                if (filename) {
                    happyEdit.openRemoteFile(filename);
                } else {
                    throw "Bad filename";
                }
            }
        },
        {
            name: "ls",
            hideCommandLine: false,
            callback: function(args) {
                happyEdit.commandLine.showOpenBuffers();
            }
        },
        {
            name: "openLocalFile",
            title: "Open Local File",
            shortcut: {
                win: "Ctrl-O",
                mac: "Command-O",
            },
            callback: function() {
                happyEdit.openLocalFile();
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
                happyEdit.commandLine.show('');
            }
        },
        {
            name: "w",
            title: "Save",
            hideCommandLine: true,
            shortcut: {
                win: "Ctrl-S",
                mac: "Command-S",
            },
            callback: function() {
                happyEdit.currentFile.save();
            }
        },
        {
            name: "nextTab",
            shortcut: {
                win: "Ctrl-Tab",
                mac: "Command-Shift-]",
            },
            callback: function() {
                happyEdit.topBar.nextTab();
            }
        },
        {
            name: "prevTab",
            shortcut: {
                win: "Ctrl-Shift-Tab",
                mac: "Command-Shift-[",
            },
            callback: function() {
                happyEdit.topBar.prevTab();
            }
        },
        {
            name: "closeFile",
            shortcut: {
                win: "Ctrl-W",
                mac: "Command-W",
            },
            callback: function() {
                happyEdit.closeFile(happyEdit.currentFile);
            }
        }
    ];

    self.each = function(callback) {
        var i;
        for (i = 0; i < self._commands.length; i += 1) {
            callback(self._commands[i]);
        }
    };

    self.getCommandByName = function(name) {
        var i;
        var command;
        for (i = 0; i < self._commands.length; i += 1) {
            command = self._commands[i];
            if (command.name === name) {
                return command;
            }
        }
    };
}
