/**
 * Manages reordering of the topbar tabs.
 */
function DragAndDropHandler(happyEdit) {
    var self = this;
    self.mouseDown = false;
    self.dragging = false;
    self.$target;
    self.$tabs = happyEdit.topBar.$tabs;
    
    self.topBarLeft = happyEdit.topBar.$tabs.offsetLeft;
    self.offsetX = 0;
    
    window.onmousedown = function(event) {
        self.mouseDown = true;
        var target = event.target;
        var $tab = null;
        
        if (hasClass(target, 'tab')) {
            $tab = target;
        } else if (hasClass(target.parentElement, 'tab')) {
            $tab = target.parentElement;
        }
        
        if ($tab) {
            var x = event.clientX - self.topBarLeft;
            var d = x - $tab.offsetLeft;
            self.offsetX = self.topBarLeft + d;
        }
        
        self.$target = $tab;
    };
    
    window.onmouseup = function(event) {
        self.mouseDown = false;
        if (self.dragging) {
            self.dragEnd();
        }
    };
    
    window.onmousemove = function(event) {
        if (self.dragging) {
            self.moveTarget(event.clientX - self.offsetX);
        } else if (self.mouseDown && self.$target) {
            self.dragStart(event.clientX);
            self.moveTarget(event.clientX);
        }
    };
    
    self.moveTarget = function(x) {
        self.$target.style.left = x +'px';
        
        var i;
        var $tab;
        var TAB_WIDTH = self.$target.offsetWidth;
        for (i = 0; i < self.$tabs.children.length; i += 1) {
            $tab = self.$tabs.children[i];
            
            if ($tab === self.$target) {
                continue;
            }
            
            var d = self.$target.offsetLeft - $tab.offsetLeft;
            
            if (d < 0 && d > -(TAB_WIDTH/2)) {
                //addClass($tab, 'drop-after');
                self.swap(self.$target, $tab)
            } else if (d > 0 && d < (TAB_WIDTH/2)) {
                //addClass($tab, 'drop-before');
                self.swap(self.$target, $tab)
            } else {
                removeClass($tab, 'drop-before');
                removeClass($tab, 'drop-after');
            }
        }
    };
    
    self.swap = function($tab1, $tab2) {
        var filename1 = $tab1.getAttribute('rel');
        var filename2 = $tab2.getAttribute('rel');
        
        var file1 = happyEdit.getBufferByFilename(filename1);
        var file2 = happyEdit.getBufferByFilename(filename2);
        
        var tab1 = happyEdit.topBar.getTabForFile(file1);
        var tab2 = happyEdit.topBar.getTabForFile(file2);
        
        happyEdit.topBar.swapTabs(tab1, tab2);
    };
    
    self.dragStart = function() {
        self.dragging = true;
        addClass(self.$target, 'drag');
    };
    
    self.dragEnd = function() {
        self.dragging = false;
        removeClass(self.$target, 'drag');
        self.$target = null;
        happyEdit.topBar.updateTabPositions();
    };
}