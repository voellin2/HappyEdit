function Tab(file, topBar, happyEdit) {
    var self = this;
    this.file = file;
    this.$title = document.createElement('span');
    this.$title.innerHTML = file.getTabLabel();
    this.$view = document.createElement('li');
    this.$view.appendChild(this.$title);

    file.onChange(function(file) {
        self.$title.innerHTML = file.getTabLabel();
    });

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
}
