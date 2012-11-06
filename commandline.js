function CommandLine(happyEdit) {
    var self = this;

    self.visible = false;
    self.selectedSuggestionIndex = null;

    self.$popup = document.querySelector('.popup.command-line');
    self.$input = document.querySelector('.popup.command-line input');
    self.$loadingAnimation = document.querySelector('.popup.command-line .loading-animation');
    self.$suggestions= document.querySelector('.popup.command-line ul');
    self.$blocker = document.querySelector('.blocker.command-line');
    self.runKeyUpHandler = false;

    (function() {
        self.$input.onkeydown = function(event) {
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
                break;

                case 38:
                self.navigateSuggestionUp();
                break;

                case 17:
                // do nothing, it was just the ctrl key lifted up
                break;

                case 9: // Tab
                self.enterTextFromFirstSuggestion();
                event.preventDefault();
                break;

                case 13:
                if (self.hasSuggestions()) {
                    self.openSelectedSuggestion();
                } else {
                    self.execute(this.value);
                }
                break;

                default:
                self.runKeyUpHandler = true;
            }
        };

        self.$input.onkeyup = function(event) {
            if (!self.runKeyUpHandler) {
                return;
            }
            self.runKeyUpHandler = false;

            var split,
                command,
                args;

            if (this.value[0] === ':' && this.value.length > 1) {
                if (this.value.indexOf(' ') === -1) {
                    self.getCommandSuggestions(this.value.split(':')[1]);
                } else {
                    split = this.value.split(':')[1].split(' ');
                    command = split[0];
                    args = split[1];
                    command = happyEdit.commands.getCommandByName(command);
                    if (command) {
                        if (command.autoComplete) {
                            command.autoComplete(args);
                        }
                    }
                }
            } else if (this.value[0] !== '/' && this.value[0] !== '?') {
                self.getCommandTSuggestions(this.value);
            } else {
                self.clearSuggestions();
            }
        };
    }());

    self.hasSuggestions = function() {
        return Boolean(this.suggestionElements && this.suggestionElements.length);
    };

    self.enterTextFromFirstSuggestion = function() {
        if (this.suggestionElements) {
            var $elem = this.suggestionElements[this.selectedSuggestionIndex];
            var title = $elem.querySelector('.title').innerHTML;
            if (this.$input.value && this.$input.value[0] === ':') {
                this.$input.value = ':' + title;
            } else {
                this.$input.value = title;
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
        if (happyEdit.files.hasOwnProperty(filename)) {
            happyEdit.switchToFile(happyEdit.files[filename]);
        } else {
            happyEdit.openRemoteFile(filename)
        }
    };

    self.commandSuggestionClickCallback = function() {
        self.hide();
        var commandName = this.getAttribute('rel');
        var command = happyEdit.commands.getCommandByName(commandName);
        command.callback();
    };

    self.fillSuggestionsList = function(suggestions) {
        var self = this;
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
                var file = happyEdit.happyEdit.files[key];
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

    self.getCommandTSuggestions = function(s) {
        if (happyEdit.fileSystem.isConnected()) {
            var suggestions = happyEdit.fileSystem.getSuggestions(s).map(function(x) {
                var y = x;
                y.onclick = self.fileSuggestionClickCallback;
                return y;
            });
            self.fillSuggestionsList(suggestions);
        }
    };

    self.getCommandSuggestions = function(s) {
        var suggestions = happyEdit.commands.getSuggestions(s).map(function(x) {
            var y = x;
            y.onclick = self.commandSuggestionClickCallback;
            return y;
        });
        self.fillSuggestionsList(suggestions);
    };

    self.grep = function(q) {
        var self = this;
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
                } catch (e) {
                    throw 'Could not parse grep response';
                    return;
                }
                self.fillSuggestionsList(json);
            }
        };

        xhr.send();
    };

    /**
     * Handles a :<command>, /<search> or CommandT request.
     */
    self.execute = function(value) {
        var self = this;
        if (value[0] === ":") {
            var split = value.split(":")[1].split(' ');
            var cmd = split[0];
            var args = split.length > 1 ? split[1] : '';
            if (isNumeric(cmd)) {
                happyEdit.editor.gotoLine(cmd);
                self.hide();
            } else {
                self.executeCommand(cmd, args);
            }
        } else if (value[0] === "/") {
            var needle = value.split('/')[1];
            happyEdit.editor.find(needle);
            self.hide();
        } else if (value[0] === "?") {
            var needle = value.split('?')[1];
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
        var self = this;
        var command = happyEdit.commands.getCommandByName(cmd);
        if (command) {
            command.callback(args);
            if (command.hideCommandLine) {
                self.hide();
            }
        } else {
            throw "Unknown command '" + cmd + "'";
        }
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
        var self = this;

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

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            editor.blur();
            self.$input.focus();
            happyEdit.setGlobalKeyboardHandler(self.globalKeyboardHandler);
        }, 100);
    };

    self.hide = function() {
        var self = this;
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        happyEdit.setGlobalKeyboardHandler(null);
        editor.focus();
    };
}
