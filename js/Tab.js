function Tab(pane, topBar, happyEdit) {
    var self = this;
    self.pane = pane;
    self.$view = HTML.createTab(pane);
    self.$title = self.$view.querySelector('.title');

    pane.onChange(function(pane) {
        self.$title.innerHTML = pane.getTabLabel();
    });

    self.select = function() {
        if (topBar.selectedTab) {
            Utils.removeClass(topBar.selectedTab.$view, 'selected');
        }

        Utils.addClass(self.$view, 'selected');
        topBar.selectedTab = self;

        if (self.pane !== happyEdit.currentPane) {
            happyEdit.switchPane(self.pane, false);
        }
    };

    self.close = function(selectClosestSibling) {
        var i = topBar.getIndexForTab(this);
        if (selectClosestSibling) {
            var closestSibling;
            if (i === topBar.tabs.length - 1) {
                closestSibling = topBar.tabs[i - 1];
            } else {
                closestSibling = topBar.tabs[i + 1];
            }
            if (closestSibling) {
                closestSibling.select();
            }
        }
        topBar.tabs.splice(i, 1);
        topBar.$tabs.removeChild(this.$view);
        topBar.updateTabPositions();
    };

    self.$view.onclick = self.select;
}
