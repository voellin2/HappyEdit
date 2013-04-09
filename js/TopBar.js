function TopBar(happyEdit) {
    var self = this;
    
    self.selectedTab = null;
    self.tabs = [];
    self.$view = document.querySelector('#top');
    self.$menuButton = self.$view.querySelector('.menu');
    self.$closeButton = self.$view.querySelector('.controls .close');
    self.$minButton = self.$view.querySelector('.controls .min');
    self.$maxButton = self.$view.querySelector('.controls .max');
    self.$tabs = self.$view.querySelector('.tabs');
    self.PREFERRED_TAB_WIDTH = 120;

    self.$menuButton.onclick = function() {
        happyEdit.menu.show();
    };

    self.$closeButton.onclick = function() {
        window.close();
    };

    self.$minButton.onclick = function() {
        chrome.app.window.current().minimize();
    };

    self.$maxButton.onclick = function() {
        if (self.getAttribute('class') === 'restore') {
            chrome.app.window.current().restore();
            self.setAttribute('class', '');
        } else {
            chrome.app.window.current().maximize();
            self.setAttribute('class', 'restore');
        }
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
        self.tabs[i].select();
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
        var tabWidth = self.calculateTabWidth();
        var x;

        self.tabs.forEach(function(tab, i) {
            tab.$view.style.width = tabWidth  + 'px';
            if (!Utils.hasClass(tab.$view, 'drag')) {
                x = i * tabWidth;
                Utils.moveX(tab.$view, x);
            }
        });
        
        self.$tabs.style.width = self.tabs.length * tabWidth + 'px';
    };

    self.updateView = function(pane) {
        var tab = self.getTabForPane(pane);
        
        if (tab === undefined) {
            tab = new Tab(pane, self, happyEdit);
            self.tabs.push(tab);
            self.$tabs.appendChild(tab.$view);
        }
        
        tab.select();
        
        self.updateTabPositions();
    };
}
