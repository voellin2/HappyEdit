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
        
        if (Utils.hasClass(target, 'tab')) {
            $tab = target;
        } else if (Utils.hasClass(target.parentElement, 'tab')) {
            $tab = target.parentElement;
        }
        
        if (Utils.hasClass($tab, 'sticky')) {
            return;
        }
        
        if ($tab) {
            var x = event.clientX - self.topBarLeft;
            var d = x - $tab.x;
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
            self.moveTarget(event.clientX - self.offsetX);
        }
    };
    
    self.moveTarget = function(x) {
        Utils.moveX(self.$target, x);
        
        var i;
        var $tab;
        var TAB_WIDTH = self.$target.offsetWidth;
        
        for (i = 0; i < self.$tabs.children.length; i += 1) {
            $tab = self.$tabs.children[i];
            
            if ($tab === self.$target || Utils.hasClass($tab, 'sticky')) {
                continue;
            }
        
            var d = Math.abs(self.$target.x - $tab.x);
            
            if (d < (TAB_WIDTH/2)) {
                self.swap(self.$target, $tab);
            }
        }
    };
    
    self.swap = function($tab1, $tab2) {
        var id1 = $tab1.getAttribute('rel');
        var id2 = $tab2.getAttribute('rel');
        
        var pane1 = happyEdit.getPaneById(id1);
        var pane2 = happyEdit.getPaneById(id2);
        
        var tab1 = happyEdit.topBar.getTabForPane(pane1);
        var tab2 = happyEdit.topBar.getTabForPane(pane2);
        
        happyEdit.topBar.swapTabs(tab1, tab2);
    };
    
    self.dragStart = function() {
        self.dragging = true;
        Utils.moveX(self.$target, 0);
        Utils.addClass(self.$target, 'drag');
        Utils.addClass(self.$target, 'no-transition');
    };
    
    self.dragEnd = function() {
        self.dragging = false;
        Utils.removeClass(self.$target, 'drag');
        Utils.removeClass(self.$target, 'no-transition');
        self.$target = null;
        happyEdit.topBar.updateTabPositions();
    };
}