function CommandLine(happyEdit) {
    var self = this;
    self.$input = null;
    self.$popup = null;
    self.$blocker = null;
    self.visible = false;
    self.selectedSuggestionIndex = null;
    self.suggestions = [];

    self.commands = {
        "w": {
            hideCommandLine: true,
            fn: function(args) {
                happyEdit.currentFile.save();
            }
        },
        "q": {
            hideCommandLine: true,
            fn: function(args) {
                happyEdit.closeFile(happyEdit.currentFile);
            }
        },
        "e": {
            hideCommandLine: true,
            fn: function(args) {
                var filename = args.join(' ');
                if (filename) {
                    happyEdit.openRemoteFile(filename);
                } else {
                    throw "Bad filename";
                }
            }
        },
        "ls": {
            hideCommandLine: false,
            fn: function(args) {
                self.showOpenBuffers();
            }
        },
        "settings": {
            hideCommandLine: true,
            fn: function(args) {
                Settings.show();
            }
        },
        "grep": {
            hideCommandLine: false,
            fn: function(args) {
                var q = args.join(' ');
                self.grep(q);
            }
        }
    };

    var self = this;
    var runKeyUpHandler = false;
    self.$popup = document.querySelector('.popup.command-line');
    self.$input = document.querySelector('.popup.command-line input');
    self.$suggestions= document.querySelector('.popup.command-line ul');
    self.$blocker = document.querySelector('.blocker.command-line');

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
                self.executeCommand(this.value);
            }
            break;

            default:
            runKeyUpHandler = true;
        }
    };

    self.$input.onkeyup = function(event) {
        if (!runKeyUpHandler) {
            return;
        }
        runKeyUpHandler = false;

        if (this.value[0] !== ':' && this.value[0] !== '/' && this.value[0] !== '?') {
            self.getAutoCompleteSuggestions(this.value);
        } else {
            self.clearSuggestions();
        }
    };

    self.hasSuggestions = function() {
        return Boolean(this.suggestionElements && this.suggestionElements.length);
    };

    self.enterTextFromFirstSuggestion = function() {
        if (this.suggestionElements) {
            var $elem = this.suggestionElements[this.selectedSuggestionIndex];
            var title = $elem.querySelector('.title').innerHTML;
            this.$input.value = title;
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

    self.getAutoCompleteSuggestions = function(s) {
        if (happyEdit.projectFiles.isConnected()) {
            var suggestions = happyEdit.projectFiles.getSuggestions(s).map(function(x) {
                var y = x;
                y.onclick = self.fileSuggestionClickCallback;
                return y;
            });
            self.fillSuggestionsList(suggestions);
        }
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

    self.executeCommand = function(value) {
        var self = this;
        if (value[0] === ":") {
            var cmd = value.split(":")[1];
            var split = cmd.split(' ');
            var cmd = split.splice(0, 1);
            var args = split;
            if (isNumeric(cmd)) {
                editor.gotoLine(cmd);
                self.hide();
            } else {
                self.runCommand(cmd, args);
            }
        } else if (value[0] === "/") {
            var needle = value.split('/')[1];
            editor.find(needle);
            self.hide();
        } else if (value[0] === "?") {
            var needle = value.split('?')[1];
            editor.findPrevious(needle);
            self.hide();
        } else {
            self.openSelectedSuggestion();
        }
    };

    self.runCommand = function(cmd, args) {
        var self = this;
        if (this.commands.hasOwnProperty(cmd)) {
            var command = this.commands[cmd];
            command.fn(args);
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

    self.show = function(startingChar) {
        var self = this;

        self.$blocker.onclick = function() {
            self.hide();
        };

        self.$input.value = startingChar;
        self.$suggestions.innerHTML = '';
        self.$suggestions.style.display = 'none';
        self.$popup.style.display = 'block';
        self.$blocker.style.display = 'block';

        // Focusing on text input right away does not work for some reason.
        setTimeout(function() {
            editor.blur();
            self.$input.focus();
        }, 100);
    };

    self.hide = function() {
        var self = this;
        self.$popup.style.display = 'none';
        self.$blocker.style.display = 'none';
        editor.focus();
    };
}
