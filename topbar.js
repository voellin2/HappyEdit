function Tab(file, topBar, happyEdit) {
    var self = this;
    this.file = file;
    this.$title = document.createElement('span');
    this.$title.innerHTML = file.basename;
    this.$title.setAttribute('title', file.displayPath);
    this.$view = document.createElement('li');
    this.$view.appendChild(this.$title);

    this.select = function() {
        if (topBar.selectedTab) {
            removeClass(topBar.selectedTab.$view, 'selected');
        }

        addClass(self.$view, 'selected');
        topBar.selectedTab = self;

        if (self.file !== happyEdit.currentFile) {
            happyEdit.switchToFile(self.file, false);
        }
    };

    this.close = function(selectClosestSibling) {
        var i = topBar.getIndexForTab(this);
        if (selectClosestSibling) {
            var closestSibling;
            if (i === topBar.tabs.length - 1) {
                closestSibling = topBar.tabs[i - 1];
            } else {
                closestSibling = topBar.tabs[i + 1];
            }
            closestSibling.select();
        }
        topBar.tabs.splice(i, 1);
        topBar.$tabs.removeChild(this.$view);
    };

    this.$view.onclick = this.select;
};

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
        if (this.getAttribute('class') === 'restore') {
            chrome.app.window.current().restore();
            this.setAttribute('class', '');
        } else {
            chrome.app.window.current().maximize();
            this.setAttribute('class', 'restore');
        }
    };

    self.getTabForFile = function(file) {
        var i;
        for (i = 0; i < this.tabs.length; i += 1) {
            if (file === this.tabs[i].file) {
                return this.tabs[i];
            }
        }
    };

    self.getIndexForTab = function(tab) {
        var i;
        for (i = 0; i < this.tabs.length; i += 1) {
            if (tab === this.tabs[i]) {
                return i;
            }
        }
    };

    self.selectTabAtIndex = function(i) {
        if (i >= this.tabs.length) {
            i = 0;
        } else if (i < 0) {
            i = this.tabs.length - 1;
        }
        this.tabs[i].select();
    };

    self.nextTab = function() {
        var i = this.getIndexForTab(this.selectedTab);
        this.selectTabAtIndex(i += 1);
    };

    self.prevTab = function() {
        var i = this.getIndexForTab(this.selectedTab);
        this.selectTabAtIndex(i -= 1);
    };

    self.updateView = function(file) {
        var self = this;
        var tab = self.getTabForFile(file);
        if (tab === undefined) {
            tab = new Tab(file, self, happyEdit);
            self.tabs.push(tab);
            self.$tabs.appendChild(tab.$view);
        }
        tab.select();
    };
}
