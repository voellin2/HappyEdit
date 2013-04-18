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
    
    self.list.onOpen = function(item) {
        item.$view.onclick();
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
            if (self.hasSuggestions()) {
                self.enterTextFromFirstSuggestion();
            }
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
                title: 'Jump to line',
                extra: 'Jump to line ' + inputString,
                onclick: self.jumpSuggestionCallback
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

    self.enterTextFromFirstSuggestion = function() {
        if (!self.suggestionElements) {
            return;
        }

        var $elem = self.list.getSelectedItem().$view;
        var value = $elem.getAttribute('rel') || $elem.querySelector('.title').innerHTML;

        // Are we completing a command argument or an entire command?
        if (self.$input.value.indexOf(' ') !== -1) {
            var split = self.$input.value.split(' ');
            self.$input.value = split[0] + ' ' + value;
        } else {
            self.$input.value = value;
        }
    };

    self.clearSuggestions = function(suggestions) {
        self.list.clear();
        self.$suggestions.innerHTML = '';
        self.$suggestions.style.display = 'none';
    };

    self.fileSuggestionClickCallback = function() {
        self.hide();
        var filename = this.getAttribute('rel');
        happyEdit.openRemoteFile(filename);
    };

    self.commandSuggestionClickCallback = function() {
        var name = this.getAttribute('rel');
        self.executeCommand(name, null);
    };

    self.projectSuggestionCallback = function() {
        self.hide();
        var host = this.getAttribute('rel');
        happyEdit.projectManager.switchProject(host);
    };

    self.jumpSuggestionCallback = function() {
        var inputString = self.$input.value;
        happyEdit.editor.gotoLine(inputString);
        self.hide();
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

    self.getCommandTSuggestions = function(s) {
        var suggestions = happyEdit.commandT.getSuggestions(s);
        return suggestions.map(function(x) {
            var y = x;
            y.onclick = self.fileSuggestionClickCallback;
            return y;
        });
    };

    self.getCommandSuggestions = function(s) {
        return happyEdit.commands.getSuggestions(s).map(function(x) {
            var y = x;
            y.onclick = self.commandSuggestionClickCallback;
            return y;
        });
    };

    self.getProjectSuggestions = function(s) {
        var suggestions = happyEdit.projectManager.getSuggestions(s);
        return suggestions.map(function(x) {
            var y = x;
            y.onclick = self.projectSuggestionCallback;
            return y;
        });
    };

    /**
     * Handles a command.
     */
    self.execute = function() {
        var inputString = self.$input.value;
        var extract = self.extractCommandParts(inputString);
        self.executeCommand(extract.name, extract.args);
    };

    /**
     * Handles a :<command>.
     */
    self.executeCommand = function(cmd, args) {
        var command = happyEdit.commands.getCommandByName(cmd);

        if (!command) {
            self.showAlert("Unknown command '" + cmd + "'");
            return;
        }

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
        self.$alertContent.innerHTML = e; // TODO escape?
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
    self.show = function(startingChar) {
        self.isVisible = true;

        self.$blocker.onclick = function() {
            self.hide();
        };

        if (startingChar !== null) {
            self.$input.value = startingChar;
            self.runKeyUpHandler = true;
            self.$input.onkeyup();
            self.$suggestions.innerHTML = '';
            self.$suggestions.style.display = 'none';
        }

        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        happyEdit.editor.blur();
        self.$input.focus();
    };

    self.hide = function() {
        self.isVisible = false;
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        self.hideAlert();
        self.$input.value = '';
        self.$input.blur();
        happyEdit.editor.focus();
    };
}
