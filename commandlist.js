function CommandList(happyEdit) {
    var self = this;
    self._commands = [
        {
            name: "edit",
            title: "Edit File",
            hideCommandLine: true,
            alias: ["e", "open"],
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
            alias: [],
            title: "Connect to a remote server",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.fileSystem.connect(args, callback);
            }
        },
        {
            name: "disconnect",
            alias: [],
            title: "Disconnect from any connected server",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.fileSystem.disconnect();
                callback();
            }
        },
        {
            name: "openFile",
            alias: [],
            title: "Quick Open File",
            global: true,
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
            name: "grep",
            alias: ["search", "find"],
            title: "Search in all files",
            hideCommandLine: true,
            callback: function(args, callback) {
                if (!args) {
                    throw "A search query must be provided.";
                }
                happyEdit.showGrepResults(args);
                callback();
            }
        },
        {
            name: "save",
            alias: ["w", "write"],
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
            alias: [],
            title: "Open New Tab",
            global: true,
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
            alias: [],
            title: "Select Next Tab",
            global: true,
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
            alias: [],
            title: "Select Previous Tab",
            global: true,
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
            alias: [],
            title: "Close Current file",
            global: true,
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
            alias: [],
            title: "Open Menu",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.menu.show();
                callback();
            }
        },
        {
            name: "explore",
            alias: [],
            title: "Open File Browser",
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
            name: "quit",
            alias: ["q", "exit"],
            title: "Quit HappyEdit",
            hideCommandLine: true,
            callback: function(args, callback) {
                happyEdit.closeFile(happyEdit.currentFile);
                callback();
            }
        },
        {
            name: "autocomplete",
            alias: [],
            title: "Autocomplete current word",
            hideCommandLine: true,
            shortcut: {
                win: "Shift-Space",
                mac: "Shift-Space",
            },
            callback: function(args, callback) {
                happyEdit.autoCompleter.show();
                callback();
            }
        }
    ];

    self.autoCompletions = new FilterList(self._commands.map(function(x) {
        var keys = [x.name];
        keys = keys.concat(x.title.toLowerCase().split(' '));
        keys = keys.concat(x.alias);
        return {
            value: x.name, keys: keys,
        };
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
