function GrepView(happyEdit) {
    var self = this;
    self.$view = document.querySelector('#grep');
    self.$h1 = self.$view.querySelector('h1');
    self.$ul = self.$view.querySelector('ul');
    self.$loading = self.$view.querySelector('.loading');
    self.filename = '__grep__';
    self.items = [];
    self.index = 0;
    
    self.selectIndex = function(index) {
        if (index < 0) {
            index = 0;
        } else if (index > self.items.length - 1) {
            index = self.items.length - 1;
        }
        
        self.index = index;
        
        var $old = self.$ul.querySelector('.active');
        var $new = self.$ul.querySelector('.item' + index);
        
        removeClass($old, 'active');
        addClass($new, 'active');
        
        $new.scrollIntoViewIfNeeded(false);
    };
    
    self.navigateUp = function() {
         self.selectIndex(self.index - 1);
    };
    
    self.navigateDown = function() {
         self.selectIndex(self.index + 1);
    };
    
    self.openActiveItem = function() {
        var item = self.items[self.index];
        happyEdit.openRemoteFile(item.filename);
    };

    self.keyUp = function(event) {
        var keyCode = event.keyCode;

        if (keyCode === 78 || keyCode === 74) {
            keyCode = 40;
        } else if (keyCode === 80 || keyCode === 75) {
            keyCode = 38;
        }

        switch (keyCode) {
            case 40:
            self.navigateDown();
            break;

            case 38:
            self.navigateUp();
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
        self.$h1.innerHTML = q;
        self.$ul.innerHTML = '';
        
        self.$loading.style.display = 'block';
        happyEdit.fileSystem.grep(q, function(data) {
            self.$loading.style.display = 'none';
            self.items = data;
            HTML.fillListView(self.$ul, data);
            self.selectIndex(0);
        });
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
        happyEdit.pushTabSpecificKeyboardHandler(self.keyUp);
    };
}
