/**
 * List of items. The list can be navigated up/down and one of the items can
 * be selected.
 * 
 * The list being passed in should be a list of associative array. Each item
 * should  have a 'model' and '$view' key.
 */
function SelectableList() {
    var self = this;
    self.items = [];
    self.index = null;
    
    self.setData = function(items) {
        self.items = items;
        self.index = null;
        if (items.length > 0) {
            self.selectIndex(0);
        }
    };
    
    self.addItem = function(item) {
        self.items.push(item);
        if (self.index === null) {
            self.selectIndex(0);
        }
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
        
        var $old = self.index === null ? null : self.items[self.index].$view;
        var $new = self.items[index].$view;
        
        Utils.removeClass($old, 'active');
        Utils.addClass($new, 'active');
        
        self.index = index;
        
        $new.scrollIntoViewIfNeeded(false);
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
            self.onSelect();
            break;

            default:
            // Empty for now
        }
    };
    
    self.onSelect = function() {
    };
}
