function CommandList(happyEdit) {
    var self = this;
    self._commands = [
        {
            name: "e",
            title: "Edit File",
            hideCommandLine: true,
            autoComplete: function(s) {
                var self = this;
                var suggestions = happyEdit.fileSystem.getSuggestions(s).map(function(x) {
                    x.onclick = happyEdit.commandLine.fileSuggestionClickCallback;
                    return x;
                });

                if (s && (suggestions.length === 0 || suggestions[0].rel !== s)) {
                    suggestions.splice(0, 0, {
                        title: 'Create new file "' + s + '"',
                        extra: capFileName(happyEdit.fileSystem.path, 60),
                        rel: s,
                        onclick: function() {
                            self.callback(s, function() {
                                happyEdit.commandLine.hide();
                            });
                        }
                    });
                }

                happyEdit.commandLine.fillSuggestionsList(suggestions);
            },
            callback: function(args, callback) {
                if (!args) {
                    throw "A filename must be provided";
                }
                var filename = args;
                var buffer = happyEdit.createNewBuffer(filename, '');
                happyEdit.switchToFile(buffer);
                callback();
            }
        },
        {
            name: "connect",
            title: "Connect to a remote server",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.fileSystem.connect(args, callback);
            }
        },
        {
            name: "disconnect",
            title: "Disconnect from any connected server",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.fileSystem.disconnect();
                callback();
            }
        },
        {
            name: "snippet",
            title: "Search for code snippets",
            hideCommandLine: false,
            autoComplete: function(s) {
                happyEdit.snippets.fillCommandLineWithAutoCompletions(s);
            },
            callback: function(args, callback) {
                happyEdit.snippets.fillCommandLineWithAutoCompletions(s);
                callback();
            }
        },
        {
            name: "stackoverflow",
            title: "Search Stack Overflow",
            hideCommandLine: false,
            autoComplete: function(s) {
                happyEdit.stackOverflow.fillCommandLineWithAutoCompletions(s);
            },
            callback: function(args, callback) {
                happyEdit.stackOverflow.fillCommandLineWithAutoCompletions(s);
                callback();
            }
        },
        {
            name: "ls",
            title: "Show Open Buffers",
            hideCommandLine: false,
            callback: function(args, callback) {
                happyEdit.commandLine.showOpenBuffers();
                callback();
            }
        },
        {
            name: "openFile",
            title: "Quick Open File",
            showInMenu: true,
            shortcut: {
                win: "Ctrl-T",
                mac: "Command-T",
            },
            callback: function(args, callback) {
                happyEdit.commandLine.show('');
                callback();
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
            callback: function(args, callback) {
                happyEdit.fileSystem.write(happyEdit.currentFile, args);
                callback(); // TODO: call when write is complete
            }
        },
        {
            name: "tabnew",
            title: "Open New Tab",
            shortcut: {
                win: "Ctrl-N",
                mac: "Command-N",
            },
            callback: function(args, callback) {
                happyEdit.openDummyBuffer();
                callback();
            }
        },
        {
            name: "tabnext",
            title: "Select Next Tab",
            shortcut: {
                win: "Ctrl-Tab",
                mac: "Command-Shift-]",
            },
            callback: function(args, callback) {
                happyEdit.topBar.nextTab();
                callback();
            }
        },
        {
            name: "tabprevious",
            title: "Select Previous Tab",
            shortcut: {
                win: "Ctrl-Shift-Tab",
                mac: "Command-Shift-[",
            },
            callback: function(args, callback) {
                happyEdit.topBar.prevTab();
                callback();
            }
        },
        {
            name: "closeFile",
            title: "Close Current file",
            shortcut: {
                win: "Ctrl-W",
                mac: "Command-W",
            },
            callback: function(args, callback) {
                happyEdit.closeFile(happyEdit.currentFile);
                callback();
            }
        },
        {
            name: "openMenu",
            title: "Open Menu",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.menu.show();
                callback();
            }
        },
        {
            name: "explore",
            title: "Open file browser",
            showInMenu: true,
            hideCommandLine: true,
            shortcut: {
                win: "Ctrl-E",
                mac: "Command-E",
            },
            callback: function(args, callback) {
                happyEdit.openFileExplorer();
                callback();
            }
        },
        {
            name: "q",
            title: "Quit HappyEdit",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.closeFile(happyEdit.currentFile);
                callback();
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
