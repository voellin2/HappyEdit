function GrepView(happyEdit) {
    var self = this;
    self.id = Utils.count();
    self.list = new SelectableList();
    self.$view = document.querySelector('#grep');
    self.$h1 = self.$view.querySelector('h1');
    self.$ul = self.$view.querySelector('ul');
    self.$loading = self.$view.querySelector('.loading');
    self.$error = self.$view.querySelector('.error');
    self.worker = new GrepWorker(happyEdit.fileSystem);
    
    self.openActiveItem = function() {
        var item = self.list.getSelectedItem();
        
        if (!item) {
            return;
        }
        
        item = item.model;
        
        happyEdit.openRemoteFile(item.filename, item.lineno);
    };

    self.keyDown = function(event) {
        var keyCode = event.keyCode;

        if (keyCode === 78 || keyCode === 74) {
            keyCode = 40;
        } else if (keyCode === 80 || keyCode === 75) {
            keyCode = 38;
        }

        switch (keyCode) {
            case 40:
            self.list.navigateDown();
            break;

            case 38:
            self.list.navigateUp();
            break;

            case 9: // Tab
            break;

            case 13:
            self.openActiveItem();
            break;

            default:
            // Empty for now
        }
    };

    self.isDummy = function() {
        return false;
    };
    
    self.load = function(q) {
        self.reset();
        self.$h1.innerHTML = q;
        
        self.worker.findInAllFiles(q, function(filename, lineNumber, snippet) {
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
        });
    };
    
    self.reset = function() {
        self.list.setData([]);
        self.$h1.innerHTML = '';
        self.$ul.innerHTML = '';
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
        self.$view.style.display = 'none';
        happyEdit.$editor.style.display = 'block';
        happyEdit.popTabSpecificKeyboardHandler();
    };

    self.focus = function() {
        self.$view.style.display = 'block';
        happyEdit.$editor.style.display = 'none';
        happyEdit.pushTabSpecificKeyboardHandler(self.keyDown);
    };
}
