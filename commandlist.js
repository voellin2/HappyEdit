function CommandList(happyEdit) {
    var self = this;
    self._commands = [
        {
            name: "e",
            title: "Edit File",
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
            name: "snippet",
            title: "Search for code snippets",
            hideCommandLine: false,
            autoComplete: function(s) {
                happyEdit.snippets.fillCommandLineWithAutoCompletions(s);
            },
            callback: function(args) {
                happyEdit.snippets.fillCommandLineWithAutoCompletions(s);
            }
        },
        {
            name: "stackoverflow",
            title: "Search Stack Overflow",
            hideCommandLine: false,
            autoComplete: function(s) {
                happyEdit.stackOverflow.fillCommandLineWithAutoCompletions(s);
            },
            callback: function(args) {
                happyEdit.stackOverflow.fillCommandLineWithAutoCompletions(s);
            }
        },
        {
            name: "ls",
            title: "Show Open Buffers",
            hideCommandLine: false,
            callback: function(args) {
                happyEdit.commandLine.showOpenBuffers();
            }
        },
        {
            name: "openFile",
            title: "Open File",
            showInMenu: true,
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
            title: "Save Current File",
            showInMenu: true,
            hideCommandLine: true,
            shortcut: {
                win: "Ctrl-S",
                mac: "Command-S",
            },
            callback: function() {
                happyEdit.fileSystem.write(happyEdit.currentFile);
            }
        },
        {
            name: "tabnext",
            title: "Select Next Tab",
            shortcut: {
                win: "Ctrl-Tab",
                mac: "Command-Shift-]",
            },
            callback: function() {
                happyEdit.topBar.nextTab();
            }
        },
        {
            name: "tabprevious",
            title: "Select Previous Tab",
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
            title: "Close Current file",
            shortcut: {
                win: "Ctrl-W",
                mac: "Command-W",
            },
            callback: function() {
                happyEdit.closeFile(happyEdit.currentFile);
            }
        },
        {
            name: "openMenu",
            title: "Open Menu",
            hideCommandLine: true,
            callback: function(args) {
                happyEdit.menu.show();
            }
        },
        {
            name: "q",
            title: "Quit HappyEdit",
            hideCommandLine: true,
            callback: function(args) {
                happyEdit.closeFile(happyEdit.currentFile);
            }
        }
    ];

    self.autoCompletions = new AutoSuggestList(self._commands.map(function(x) {
        return x.name;
    }));

    self.each = function(callback) {
        var i;
        for (i = 0; i < self._commands.length; i += 1) {
            callback(self._commands[i]);
        }
    };

    self.getCommandByName = function(name) {
        var i;
        var command;
        name = name.toLowerCase();
        for (i = 0; i < self._commands.length; i += 1) {
            command = self._commands[i];
            if (command.name.toLowerCase() === name) {
                return command;
            }
        }
    };

    /**
     * Gets a list of auto completions in the format expected by the
     * CommandLine.
     */
    self.getSuggestions = function(q) {
        var suggestions = [];
        var i;
        var autoCompletions = self.autoCompletions.getSuggestions(q);
        var autoCompletion;
        var command;
        for (i = 0; i < autoCompletions.length; i += 1) {
            autoCompletion = autoCompletions[i];
            command = self.getCommandByName(autoCompletion);
            suggestions.push({
                title: command.name,
                extra: command.title || '',
                shortcut: getShortcutForCommand(command),
                rel: command.name,
            });
        }
        return suggestions;
    };
}
