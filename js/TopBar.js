function TopBar(happyEdit) {
    var self = this;
    
    self.selectedTab = null;
    self.tabs = [];
    self.$view = document.querySelector('#top');
    self.$closeButton = self.$view.querySelector('.controls .close');
    self.$minButton = self.$view.querySelector('.controls .min');
    self.$maxButton = self.$view.querySelector('.controls .max');
    self.$tabs = self.$view.querySelector('.tabs');
    self.PREFERRED_TAB_WIDTH = 120;
    
    self.getNumberOfTabs = function() {
        return self.tabs.length;
    };

    self.$closeButton.onclick = function() {
        window.close();
    };

    self.$minButton.onclick = function() {
        chrome.app.window.current().minimize();
    };

    self.$maxButton.onclick = function() {
        if (this.getAttribute('class') === 'restore') {
            chrome.app.window.current().restore();
            this.setAttribute('class', '');
        } else {
            chrome.app.window.current().maximize();
            this.setAttribute('class', 'restore');
        }
    };
    
    self.getStickyTabs = function() {
    };
    
    /**
     * Remove all regular tabs, but preserve sticky tabs.
     */
    self.reset = function() {
        var stickyTabs = [];
        
        self.tabs.forEach(function(tab) {
            if (tab.pane.sticky === true) {
                stickyTabs.push(tab);
            } else {
                self.$tabs.removeChild(tab.$view);
            }
        });
        
        self.selectedTab = stickyTabs[0];
        self.tabs = stickyTabs;
    };
    
    self.getTabForPane = function(pane) {
        var ret;
        
        self.tabs.forEach(function(tab) {
            if (pane === tab.pane) {
                ret = tab;
                return false;
            }
        });
        
        return ret;
    };

    self.getIndexForTab = function(tab1) {
        var ret;
        
        self.tabs.forEach(function(tab2, i) {
            if (tab1 === tab2) {
                ret = i;
                return false;
            }
        });
        
        return ret;
    };

    self.selectTabAtIndex = function(i) {
        if (i >= self.tabs.length) {
            i = 0;
        } else if (i < 0) {
            i = self.tabs.length - 1;
        }
        var tab = self.tabs[i];
        self.selectTab(tab);
    };

    self.nextTab = function() {
        var i = self.getIndexForTab(self.selectedTab);
        self.selectTabAtIndex(i += 1);
    };

    self.prevTab = function() {
        var i = self.getIndexForTab(self.selectedTab);
        self.selectTabAtIndex(i -= 1);
    };
    
    self.calculateTabWidth = function() {
        var offsetFromRight = 40;
        var maxTabWidth = self.PREFERRED_TAB_WIDTH;
        
        var w = window.innerWidth - self.$tabs.offsetLeft - offsetFromRight;
        var tabWidth = w / self.tabs.length;
        
        if (tabWidth > maxTabWidth) {
            tabWidth = maxTabWidth;
        }
        
        return tabWidth;
    };
    
    self.swapTabs = function(tab1, tab2) {
        var index1 = self.getIndexForTab(tab1);
        var index2 = self.getIndexForTab(tab2);
        
        self.tabs[index1] = tab2;
        self.tabs[index2] = tab1;
        
        self.updateTabPositions();
        
        happyEdit.eventSystem.callEventListeners('tabs_swapped', [tab1, tab2]);
    };
    
    self.updateTabPositions = function() {
        var standardTabWidth = self.calculateTabWidth();
        var x = 0;

        self.tabs.forEach(function(tab, i) {
            var tabWidth = standardTabWidth;
            
            if (tab.pane.tabCssClass === 'home') {
                tabWidth = 60;
            }
            
            tab.$view.style.width = tabWidth  + 'px';
            
            if (!Utils.hasClass(tab.$view, 'drag')) {
                Utils.moveX(tab.$view, x);
                x += tabWidth;
            }
        });
        
        self.$tabs.style.width = x + 'px';
    };
    
    self.getClosestSibling = function(tab) {
        var i = self.getIndexForTab(tab);
        
        if (i === self.tabs.length - 1) {
            return self.tabs[i - 1];
        }
        
        return self.tabs[i + 1];
    };

    self.addTabForPane = function(pane) {
        var tab = new Tab(pane, happyEdit);
        self.tabs.push(tab);
        self.$tabs.appendChild(tab.$view);
        self.updateTabPositions();
    };

    self.closeTab = function(tab) {
        var i = self.getIndexForTab(tab);
        self.tabs.splice(i, 1);
        self.$tabs.removeChild(tab.$view);
        self.updateTabPositions();
    };

    self.selectTab = function(tab) {
        if (self.selectedTab) {
            Utils.removeClass(self.selectedTab.$view, 'selected');
        }

        Utils.addClass(tab.$view, 'selected');
        self.selectedTab = tab;

        if (tab.pane !== happyEdit.currentPane) {
            happyEdit.switchPane(tab.pane, false);
        }
    };
}
