function CommandLine(happyEdit) {
    var self = this;

    self.$popup = document.querySelector('.popup.command-line');
    self.$input = document.querySelector('.popup.command-line input');
    self.$alert = self.$popup.querySelector('.alert');
    self.$alertContent = self.$alert.querySelector('.content');
    self.$suggestions = document.querySelector('.popup.command-line ul');
    self.$blocker = document.querySelector('.blocker.command-line');
    self.runKeyUpHandler = false;
    self.isVisible = false;
    self.list = new SelectableList();
    
    self.$blocker.onclick = function() {
        self.hide();
    };
    
    self.list.onOpen = function(item) {
        var model = item.model;

        switch (model.type) {
            case 'command':
            self.executeCommand(model.command, null);
            break;

            case 'file':
            self.hide();
            happyEdit.openRemoteFile(model.filename);
            break;

            case 'project':
            self.hide();
            happyEdit.projectManager.switchProject(model.project);
            break;

            case 'lineJump':
            self.hide();
            happyEdit.editor.gotoLine(model.lineNumber);
            break;

            default:
            break;
        }
    };

    self.keyDown = function(event) {
        self.hideAlert();
        keyCode = event.keyCode;

        if (event.ctrlKey && (keyCode === 78 || keyCode === 74)) {
            keyCode = 40;
        } else if (event.ctrlKey && (keyCode === 80 || keyCode === 75)) {
            keyCode = 38;
        }

        switch (keyCode) {
            case 27:
            self.hide();
            break;

            case 40:
            self.list.navigateDown();
            event.preventDefault();
            break;

            case 38:
            self.list.navigateUp();
            event.preventDefault();
            break;

            case 17:
            // do nothing, it was just the ctrl key lifted up
            break;

            case 9: // Tab
            self.tabComplete();
            event.preventDefault();
            break;

            case 13:
            event.preventDefault();
            event.stopPropagation();
            
            if (self.hasSuggestions()) {
                self.list.openSelectedItem();
            } else {
                self.execute();
            }
            
            break;

            default:
            self.runKeyUpHandler = true;
        }
    };

    self.keyUp = function(event) {
        if (!self.runKeyUpHandler) {
            return;
        }

        self.runKeyUpHandler = false;

        var inputString = this.value,
            command,
            extract;

        if (!inputString) {
            return;
        }

        self.fillSuggestionsList(self.getSuggestions(inputString));
    };

    self.getSuggestions = function(inputString) {
        var ret = [];

        if (Utils.isNumeric(inputString)) {
            ret.push({
                type: 'lineJump',
                title: 'Jump to line',
                extra: 'Jump to line ' + inputString,
                lineNumber: Number(inputString)
            });
        }

        ret = ret.concat(self.getCommandSuggestions(inputString));
        ret = ret.concat(self.getProjectSuggestions(inputString));
        ret = ret.concat(self.getCommandTSuggestions(inputString));

        return ret;
    };

    self.extractCommandParts = function(inputString) {
        var split = inputString.split(' ');
        return {
            name: split[0],
            args: split.splice(1, split.length).join(' ')
        };
    };

    self.$input.onkeydown = self.keyDown;
    self.$input.onkeyup = self.keyUp;

    self.hasSuggestions = function() {
        return self.list.getLength() > 0;
    };

    self.tabComplete = function() {
        if (!self.hasSuggestions()) {
            return;
        }

        var item = self.list.getSelectedItem();
        var value = item.model.title;

        self.$input.value = value;
    };

    self.clearSuggestions = function() {
        self.list.clear();
        self.$suggestions.innerHTML = '';
        self.$suggestions.style.display = 'none';
    };

    self.fillSuggestionsList = function(suggestions) {
        self.clearSuggestions();

        if (!suggestions || suggestions.length === 0) {
            self.$suggestions.style.display = 'none';
            return;
        }
        
        suggestions.forEach(function(suggestion) {
            var $view = HTML.createSuggestionView(suggestion);
            
            self.list.addItem({
                model: suggestion,
                $view: $view
            });
            
            self.$suggestions.appendChild($view);
        });
        
        self.$suggestions.style.display = 'block';
    };

    self.getCommandTSuggestions = function(q) {
        var commandT = happyEdit.commandT;
        var ret = [];
        var results = commandT.filterList.getSuggestions(q);

        results.forEach(function(suggestion) {
            var split = suggestion.split(PATH_SEPARATOR);
            ret.push({
                type: 'file',
                title: split.pop(),
                extra: Utils.capFileName(suggestion, 60),
                filename: suggestion
            });
        });

        return ret;
    };

    self.getCommandSuggestions = function(q) {
        var commandList = happyEdit.commands;
        var ret = [];
        var results = commandList.filterList.getSuggestions(q);
        
        results.forEach(function(suggestion) {
            var command = commandList.getCommandByName(suggestion);
            
            if (command.hideFromCommandLine === true) {
                return true;
            }
            
            ret.push({
                type: 'command',
                title: command.name,
                extra: command.title || '',
                command: command,
                shortcut: Utils.getShortcutForCommand(command)
            });
        });
        
        return ret;
    };

    self.getProjectSuggestions = function(q) {
        var projectManager = happyEdit.projectManager;
        var ret = [];
        var results = projectManager.filterList.getSuggestions(q);
        
        results.forEach(function(projectId) {
            var project = projectManager.getProjectById(projectId);
            ret.push({
                type: 'project',
                title: project.title,
                extra: 'Switch to project (' + project.title + ')',
                project: project
            });
        });
        
        return ret;
    };

    /**
     * Handles a command.
     */
    self.execute = function() {
        var inputString = self.$input.value;
        var extract = self.extractCommandParts(inputString);
        var command = happyEdit.commands.getCommandByName(extract.name);

        if (!command) {
            self.showAlert("Unknown command '" + extract.name + "'");
            return;
        }
        
        self.executeCommand(command, extract.args);
    };

    /**
     * Handles a :<command>.
     */
    self.executeCommand = function(command, args) {
        try {
            command.callback(args, function(error) {
                if (error) {
                    self.showAlert(error);
                } else {
                    self.hide();
                }
            });
        } catch (e) {
            self.showAlert(e);
            throw e; // We want to see the traceback in the console.
        }
    };
    
    self.showAlert = function(e) {
        self.$alertContent.innerHTML = Utils.htmlEscape(e);
        self.$alert.style.display = 'block';
    };

    self.hideAlert = function(e) {
        self.$alertContent.innerHTML = '';
        self.$alert.style.display = 'none';
    };

    /**
     * Display the command line. If startingChar is null, the last state will
     * be preserved.
     */
    self.show = function() {
        self.isVisible = true;

        self.$input.value = '';
        self.runKeyUpHandler = false;
        self.clearSuggestions();
        self.hideAlert();
    
        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        happyEdit.editor.blur();
        self.$input.focus();
    };

    self.hide = function() {
        self.isVisible = false;
        
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';

        self.$input.blur();
        happyEdit.editor.focus();
    };
}
