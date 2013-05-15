/**
 * List of items. The list can be navigated up/down and one of the items can
 * be selected.
 * 
 * The list being passed in should be a list of associative array. Each item
 * should  have a 'model' and '$view' key.
 * 
 * If a $parent element has been given, the items will be automatically
 * added/removed from it.
 */
function SelectableList(args) {
    var self = this;
    
    var defaults = {
        $parent: null,
        hover: true
    };
    
    args = Utils.extend(defaults, (args || {}));
    
    self.items = [];
    self.index = 0;
    self.$parent = args.$parent;
    
    self.clear = function() {
        self.items = [];
        self.index = null;
    };
    
    self.onItemClick = function() {
        var $elem = this;
        var index = Number($elem.dataset.index);
        self.selectIndex(index);
        self.openSelectedItem();
    };
    
    self.onItemMouseMove = function() {
        if (!args.hover) {
            return;
        }
        
        var $elem = this;
        var index = Number($elem.dataset.index);
        
        self.selectIndex(index);
    };
    
    self.getLength = function() {
        return self.items.length;
    };
    
    self.getIndex = function() {
        return self.index;
    };
    
    self.addItem = function(item) {
        item.$view.dataset.index = self.items.length;
        item.$view.onclick = self.onItemClick;
        item.$view.onmousemove = self.onItemMouseMove;
        
        self.items.push(item);
        
        if (self.$parent) {
            self.$parent.appendChild(item.$view);
        }
    };
    
    self.removeItemAtIndex = function(index) {
        var item = self.items.splice(index, 1)[0];
        
        if (self.$parent) {
            self.$parent.removeChild(item.$view);
        }
        
        return item;
    };
    
    self.getSelectedItem = function() {
        return self.items[self.index];
    };
    
    self.selectIndex = function(index) {
        if (index < 0) {
            index = 0;
        } else if (index > self.items.length - 1) {
            index = self.items.length - 1;
        }
        
        if (self.index !== null) {
            var oldItem = self.items[self.index];
            if (oldItem) {
                if (oldItem.model.blur) {
                    oldItem.model.blur();
                } 
                
                Utils.removeClass(oldItem.$view, 'active');
            }
        }
        
        var newItem = self.items[index];
        
        if (newItem.model.focus) {
            newItem.model.focus();
        } 
        
        Utils.addClass(newItem.$view, 'active');
        
        self.index = index;
        
        newItem.$view.scrollIntoViewIfNeeded(false);
        
        self.onSelect(newItem);
    };
    
    self.navigateUp = function() {
         self.selectIndex(self.index - 1);
    };
    
    self.navigateDown = function() {
         self.selectIndex(self.index + 1);
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
            self.navigateDown();
            break;

            case 38:
            self.navigateUp();
            break;
            
            case 9: // Tab
            break;

            case 13:
            self.openSelectedItem();
            break;

            default:
            // Empty for now
        }
    };
    
    self.openSelectedItem = function() {
        var item = self.getSelectedItem();
        if (item) {
            self.onOpen(item);
        }
    };
    
    self.onOpen = function(item) {
    };
    
    self.onSelect = function(item) {
    };
}
