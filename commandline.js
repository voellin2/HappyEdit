function CommandLine(happyEdit) {
    var self = this;

    self.visible = false;
    self.selectedSuggestionIndex = null;

    self.$popup = document.querySelector('.popup.command-line');
    self.$input = document.querySelector('.popup.command-line input');
    self.$alert = self.$popup.querySelector('.alert');
    self.$alertContent = self.$alert.querySelector('.content');
    self.$loadingAnimation = document.querySelector('.popup.command-line .loading-animation');
    self.$suggestions= document.querySelector('.popup.command-line ul');
    self.$blocker = document.querySelector('.blocker.command-line');
    self.runKeyUpHandler = false;

    self.keyDown = function(event) {
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
            self.navigateSuggestionDown();
            event.preventDefault();
            break;

            case 38:
            self.navigateSuggestionUp();
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
            if (self.hasSuggestions()) {
                self.openSelectedSuggestion();
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

        if (inputString[0] === ':' && inputString.length > 1) {
            if (inputString.indexOf(' ') === -1) {
                self.showCommandSuggestions(inputString.split(':')[1]);
            } else {
                extract = self.extractCommandParts(inputString);
                command = happyEdit.commands.getCommandByName(extract.name);
                if (command && command.autoComplete) {
                    command.autoComplete(extract.args);
                }
            }
        } else if (inputString[0] !== '/' && inputString[0] !== '?') {
            self.showCommandTSuggestions(inputString);
        } else {
            self.clearSuggestions();
        }
    };

    self.extractCommandParts = function(inputString) {
        var split = inputString.substr(1).split(' ');
        return {
            name: split[0],
            args: split.splice(1, split.length).join(' ')
        };
    };

    self.$input.onkeydown = self.keyDown;
    self.$input.onkeyup = self.keyUp;

    self.hasSuggestions = function() {
        return Boolean(this.suggestionElements && this.suggestionElements.length);
    };

    self.enterTextFromFirstSuggestion = function() {
        if (this.suggestionElements) {
            var $elem = this.suggestionElements[this.selectedSuggestionIndex];
            var value = $elem.getAttribute('rel') || $elem.querySelector('.title').innerHTML;
            if (this.$input.value && this.$input.value[0] === ':') {

                // Are we completing a command argument or an entire command?
                if (this.$input.value.indexOf(' ') !== -1) {
                    var split = this.$input.value.split(' ');
                    this.$input.value = split[0] + ' ' + value;

                } else {
                    this.$input.value = ':' + value;
                }

            } else {
                this.$input.value = value;
            }
        }
    };

    self.selectSuggestion = function(newIndex) {
        if (newIndex >= this.suggestionElements.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = this.suggestionElements.length - 1;
        }
        if (this.selectedSuggestionIndex !== null) {
            removeClass(this.suggestionElements[this.selectedSuggestionIndex], 'hover');
        }
        this.selectedSuggestionIndex = newIndex;
        addClass(this.suggestionElements[newIndex], 'hover');
    };

    self.navigateSuggestionDown = function() {
        this.selectSuggestion((this.selectedSuggestionIndex || 0) + 1);
    };

    self.navigateSuggestionUp = function() {
        this.selectSuggestion((this.selectedSuggestionIndex || 0) - 1);
    };

    self.openSelectedSuggestion = function() {
        this.suggestionElements[this.selectedSuggestionIndex].onclick();
    };

    self.clearSuggestions = function(suggestions) {
        this.suggestionElements = [];
        this.selectedSuggestionIndex = null;
        this.$suggestions.innerHTML = '';
        this.$suggestions.style.display = 'none';
    };

    self.fileSuggestionClickCallback = function() {
        self.hide();
        var filename = this.getAttribute('rel');
        happyEdit.openRemoteFile(filename);
    };

    self.commandSuggestionClickCallback = function() {
        var extract = self.extractCommandParts(self.$input.value);
        self.executeCommand(extract.name, extract.args);
    };

    self.getArgs = function() {
        var split = self.$input.value.split(':')[1].split(' ');
        var command = split[0];
        var args = split[1];
        return args;
    };

    self.fillSuggestionsList = function(suggestions) {
        var fragment = document.createDocumentFragment();

        self.clearSuggestions();

        if (suggestions && suggestions.length) {
            suggestions.forEach(function(suggestion, i) {
                var $li = HTML.createSuggestionView(suggestion);
                fragment.appendChild($li);
                self.suggestionElements.push($li);
            });
            self.$suggestions.appendChild(fragment);
            self.$suggestions.style.display = 'block';
            self.selectSuggestion(0);
        } else {
            self.$suggestions.style.display = 'none';
        }
    };

    self.showOpenBuffers = function() {
        var key;
        var file;
        var suggestions = [];
        for (key in happyEdit.files) {
            if (happyEdit.files.hasOwnProperty(key)) {
                file = happyEdit.happyEdit.files[key];
                suggestions.push({
                    title: file.basename,
                    extra: file.displayPath,
                    rel: file.displayPath,
                    onclick: self.fileSuggestionClickCallback
                });
            }
        }
        self.fillSuggestionsList(suggestions);
    };

    self.showCommandTSuggestions = function(s) {
        var suggestions = happyEdit.fileSystem.getSuggestions(s).map(function(x) {
            var y = x;
            y.onclick = self.fileSuggestionClickCallback;
            return y;
        });
        self.fillSuggestionsList(suggestions);
    };

    self.showCommandSuggestions = function(s) {
        var suggestions = happyEdit.commands.getSuggestions(s).map(function(x) {
            var y = x;
            y.onclick = self.commandSuggestionClickCallback;
            return y;
        });
        self.fillSuggestionsList(suggestions);
    };

    self.grep = function(q) {
        var xhr = new XMLHttpRequest();

        if (!q) {
            return;
        }

        self.$input.setAttribute('disabled');

        xhr.open("GET", '/grep?q=' + encodeURIComponent(q));

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                self.$input.removeAttribute('disabled');
                try {
                    var json = JSON.parse(xhr.responseText);
                    self.fillSuggestionsList(json);
                } catch (e) {
                    throw 'Could not parse grep response';
                }
            }
        };

        xhr.send();
    };

    /**
     * Handles a :<command>, /<search> or CommandT request.
     */
    self.execute = function() {
        var value = self.$input.value;
        var needle;
        var extract;
        if (value[0] === ":") {
            extract = self.extractCommandParts(value);
            if (isNumeric(extract.name)) {
                happyEdit.editor.gotoLine(extract.name);
                self.hide();
            } else {
                self.executeCommand(extract.name, extract.args);
            }
        } else if (value[0] === "/") {
            needle = value.split('/')[1];
            happyEdit.editor.find(needle);
            self.hide();
        } else if (value[0] === "?") {
            needle = value.split('?')[1];
            happyEdit.editor.findPrevious(needle);
            self.hide();
        } else {
            self.openSelectedSuggestion();
        }
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
                } else if (command.hideCommandLine) {
                    self.hide();
                }
            });
        } catch (e) {
            self.showAlert(e);
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

    self.isVisible = function() {
        return this.$popup.style.display === 'block';
    };

    self.globalKeyboardHandler = function(event) {
        self.$input.focus();
    };

    self.showLoading = function() {
        self.$loadingAnimation.style.display = 'block';
    };

    self.hideLoading = function() {
        self.$loadingAnimation.style.display = 'none';
    };

    /**
     * Display the command line. If startingChar is null, the last state will
     * be preserved.
     */
    self.show = function(startingChar) {

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

        happyEdit.pushGlobalKeyboardHandler(self.globalKeyboardHandler);
        happyEdit.editor.blur();
        self.$input.focus();
    };

    self.hide = function() {
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        self.hideAlert();
        happyEdit.popGlobalKeyboardHandler();
        happyEdit.editor.focus();
    };
}
