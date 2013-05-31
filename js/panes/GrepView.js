function GrepView(happyEdit) {
    var self = this;
    self.id = Utils.count();
    self.$view = document.querySelector('#grep');
    self.$input = self.$view.querySelector('input');
    self.$ul = self.$view.querySelector('ul');
    self.$progress = self.$view.querySelector('.progress');
    self.$error = self.$view.querySelector('.error');
    self.worker = new GrepWorker(happyEdit.fileSystem);
    
    self.list = new SelectableList({
        hover: false
    });
    
    self.list.onOpen = function(item, switchPane) {
        var model = item.model;
        happyEdit.openRemoteFile(model.filename, model.lineNumber, switchPane);
    };
    
    self.isSearchFieldFocused = function() {
        return document.activeElement === self.$input;
    };
    
    self.runQueryInSearchField = function() {
        var q = self.$input.value;
        self.load(q);
    };

    self.keyDown = function(event) {
        if (self.isSearchFieldFocused()) {
            if (event.keyCode === 13) {
                self.runQueryInSearchField();
            }
            return;
        }
        
        self.list.keyDown(event);
    };

    self.isDummy = function() {
        return false;
    };
    
    self.progressCallback = function(filename, count, nFiles) {
        self.$progress.innerHTML = count + '/' + nFiles + ' ' + filename;
    };
    
    self.matchFoundCallback = function(filename, lineNumber, snippet) {
        var model = {
            snippet: snippet,
            lineNumber: lineNumber,
            filename: filename
        };
        
        var $view = HTML.createGrepListItem(model);
        
        self.list.addItem({
            model: model,
            $view: $view
        });
        
        self.$ul.appendChild($view);
    };
    
    self.load = function(q) {
        self.reset();
        self.$input.value = q;
        
        if (q) {
            self.worker.findInAllFiles(q, self.progressCallback, self.matchFoundCallback);
            self.$input.blur();
        }
    };
    
    self.reset = function() {
        self.list.clear();
        self.$input.value = '';
        self.$ul.innerHTML = '';
        self.$progress.innerHTML = '';
        self.hideError();
    };
    
    self.showError = function(msg) {
        self.$error.innerHTML = msg; // TODO escape?
        self.$error.style.display = 'block';
    };
    
    self.hideError = function() {
        self.$error.innerHTML = '';
        self.$error.style.display = 'none';
    };
    
    self.getTabLabel = function() {
        return 'Grep';
    };
    
    self.onChange = function(callback) {
    };
    
    self.blur = function() {
        happyEdit.popTabSpecificKeyboardHandler();
    };

    self.focus = function() {
        happyEdit.pushTabSpecificKeyboardHandler(self.keyDown);
        
        if (self.$input.value) {
            self.$input.blur();
        } else {
            self.$input.focus();
        }
    };
}
