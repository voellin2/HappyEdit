function CommandList(happyEdit) {
    var self = this;
    self._commands = [
        {
            name: "edit",
            title: "Edit File",
            alias: ["e", "open"],
            callback: function(args, callback) {
                if (!args) {
                    throw "A filename must be provided";
                }
                var filename = args;
                var buffer = happyEdit.createBuffer(filename, '');
                happyEdit.switchPane(buffer);
                callback();
            }
        },
        {
            name: "reload",
            alias: ["refresh"],
            title: "Reload current buffer",
            shortcut: {
                win: "Ctrl-R",
                mac: "Command-R",
            },
            callback: function(args, callback) {
                if (happyEdit.currentPane.constructor !== Buffer) {
                    return;
                }
                
                var currentPane = happyEdit.currentPane;
                var filename = currentPane.filename;
                
                happyEdit.fileSystem.getFile(filename, function(body) {
                    currentPane.setBody(body);
                });
            
                callback();
            }
        },
        {
            name: "connect",
            alias: [],
            title: "Connect to a remote server",
            callback: function(args, callback) {
                happyEdit.projectManager.disconnect();
                happyEdit.fileSystem.connect(args, callback);
            }
        },
        {
            name: "disconnect",
            alias: [],
            title: "Disconnect from any connected server",
            callback: function(args, callback) {
                happyEdit.projectManager.disconnect();
                callback();
            }
        },
        {
            name: "renameProject",
            alias: [],
            title: "Rename the current project",
            callback: function(args, callback) {
                var name = args;
                
                if (!name) {
                    throw "A name must be given";
                }
                
                happyEdit.projectManager.renameCurrentProject(name);
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
            callback: function(args, callback) {
                var selection = happyEdit.getSelection();
                
                if (!args && !selection) {
                    throw "A search query must be provided.";
                }
                
                happyEdit.showGrepResults(args || selection);
                callback();
            }
        },
        {
            name: "save",
            alias: ["w", "write"],
            title: "Save Current File",
            showInMenu: true,
            shortcut: {
                win: "Ctrl-S",
                mac: "Command-S",
            },
            callback: function(args, callback) {
                happyEdit.fileSystem.write(happyEdit.currentPane, args);
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
            name: "close",
            alias: [],
            title: "Close current tab",
            global: true,
            shortcut: {
                win: "Ctrl-W",
                mac: "Command-W",
            },
            callback: function(args, callback) {
                happyEdit.closePane(happyEdit.currentPane);
                callback();
            }
        },
        {
            name: "openMenu",
            alias: [],
            title: "Open Menu",
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
            callback: function(args, callback) {
                happyEdit.closePane(happyEdit.currentPane);
                callback();
            }
        },
        {
            name: "autocomplete",
            alias: [],
            title: "Autocomplete current word",
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
                shortcut: Utils.getShortcutForCommand(command),
                rel: command.name,
            });
        }
        return suggestions;
    };
}
