function Explorer(happyEdit) {
    var self = this;
    self.activeIndex = 0;
    
    self.$view = HTML.createExplorer({
        files: happyEdit.fileSystem.files
    });

    self.selectIndex = function(index) {
        var $old = self.$view.querySelector('.active');
        var $new = self.$view.querySelector('.file' + index);
        removeClass($old, 'active');
        addClass($new, 'active');
    };
    
    happyEdit.$explorers.appendChild(self.$view);
    
    self.getTabLabel = function() {
        return 'Explore';
    };
    
    self.onChange = function(callback) {
    };
    
    self.blur = function() {
        happyEdit.$explorers.style.display = 'none';
        happyEdit.$editor.style.display = 'block';
        happyEdit.popGlobalKeyboardHandler();
    };

    self.focus = function() {
        var $elems = happyEdit.$explorers.querySelectorAll('.explorer');
        var i;
        
        for (i = 0; i < $elems.length; i += 1) {
            $elems[i].style.display = 'none';
        }

        self.$view.style.display = 'block';
        happyEdit.$explorers.style.display = 'block';
        happyEdit.$editor.style.display = 'none';
        happyEdit.editor.blur();
        happyEdit.pushGlobalKeyboardHandler(self.getGlobalKeyboardHandler());
    };
    
    self.keyDown = function(event) {
        keyCode = event.keyCode;

        if (keyCode === 78 || keyCode === 74) {
            keyCode = 40;
        } else if (keyCode === 80 || keyCode === 75) {
            keyCode = 38;
        }
        
        console.log(keyCode, self.activeIndex);

        switch (keyCode) {
            case 27:
            // Leave?
            break;

            case 40:
            self.navigateDown();
            event.preventDefault();
            break;

            case 38:
            self.navigateUp();
            event.preventDefault();
            break;

            case 17:
            // do nothing, it was just the ctrl key lifted up
            break;

            case 9: // Tab
            break;

            case 13:
            self.openActiveFile();
            break;

            default:
            // Empty for now
        }
    };
    
    self.getGlobalKeyboardHandler = function() {
        return self.keyDown;
    };
    
    self.navigateUp = function() {
        self.activeIndex -= 1;
        if (self.activeIndex < 0) {
            self.activeIndex = 0;
        }
        self.selectIndex(self.activeIndex);
    };
    
    self.navigateDown = function() {
        self.activeIndex += 1;
        var len = happyEdit.fileSystem.files.length;
        if (self.activeIndex === len) {
            self.activeIndex = len - 1;
        }
        self.selectIndex(self.activeIndex);
    };
    
    self.openActiveFile = function() {
        var $file = self.$view.querySelector('.active');
        happyEdit.openRemoteFile($file.innerHTML);
    };
    
    self.selectIndex(0);
}
