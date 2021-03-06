function CommandList(happyEdit) {
    var self = this;
    self._commands = [
        {
            name: "openCommandLine",
            title: "Open the command line",
            alias: [],
            hideFromCommandLine: true,
            global: true,
            shortcut: {
                win: "Ctrl-T",
                mac: "Command-T",
            },
            callback: function(args, callback) {
                happyEdit.commandLine.show();
                callback();
            }
        },
        {
            name: "fullscreen",
            title: "Toggle fullscreen",
            alias: [],
            callback: function(args, callback) {
                var $body = document.querySelector('body');
                
                if (Utils.hasClass($body, 'fullscreen')) {
                    document.webkitExitFullscreen();
                    Utils.removeClass($body,'fullscreen');
                } else {
                    $body.webkitRequestFullscreen();
                    Utils.addClass($body,'fullscreen');
                }
                
                callback();
            }
        },
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
                happyEdit.eventSystem.callEventListeners('file_created', buffer);
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
            name: "delete",
            alias: ["remove"],
            title: "Delete current file from disk",
            callback: function(args, callback) {
                if (happyEdit.currentPane.constructor !== Buffer) {
                    return;
                }
                
                var filename = happyEdit.currentPane.filename;
                
                happyEdit.fileSystem.deleteFile(filename);
                happyEdit.closePane(happyEdit.currentPane);
                
                callback();
            }
        },
        {
            name: "rename",
            alias: ["move", "mv"],
            title: "Rename current file",
            callback: function(args, callback) {
                if (happyEdit.currentPane.constructor !== Buffer) {
                    return;
                }
                
                if (!args) {
                    throw "A filename must be provided";
                }
                
                var oldName = happyEdit.currentPane.filename;
                var newName = args;
                var buffer = happyEdit.currentPane;
                
                if (!Utils.startsWith(newName, './')) {
                    newName = buffer.dirname + "/" + newName;
                }
                
                buffer.rename(newName);
                
                happyEdit.fileSystem.write(buffer, null, function() {
                    happyEdit.fileSystem.deleteFile(oldName);
                });
                
                callback();
            }
        },
        {
            name: "disconnect",
            alias: [],
            title: "Disconnect from any connected server",
            callback: function(args, callback) {
                happyEdit.server.disconnect();
                callback();
            }
        },
        {
            name: "grep",
            alias: ["search", "find"],
            title: "Search in all files",
            callback: function(args, callback) {
                var selection = happyEdit.editor.getSelection();
                happyEdit.showGrepResults(args || selection || null);
                callback();
            }
        },
        {
            name: "save",
            alias: ["w", "write"],
            title: "Save Current File",
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
            name: "quit",
            alias: ["q", "exit"],
            title: "Quit HappyEdit",
            callback: function(args, callback) {
                happyEdit.exit();
                callback();
            }
        },
        {
            name: "autocomplete",
            alias: [],
            title: "Autocomplete current word",
            shortcut: {
                win: "Ctrl-Space",
                mac: "Ctrl-Space",
            },
            callback: function(args, callback) {
                happyEdit.autoCompleter.show();
                callback();
            }
        }
    ];

    self.filterList = new FilterList(self._commands.map(function(x) {
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
}
