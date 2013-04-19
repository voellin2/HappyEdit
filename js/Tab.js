function Tab(pane, topBar, happyEdit) {
    var self = this;
    self.pane = pane;
    self.$view = HTML.createTab(pane);
    self.$title = self.$view.querySelector('.title');
    
    self.$view.querySelector('.close').onclick = function() {
        happyEdit.closePane(self.pane);
    };

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

    /**
     * Removes this tab from the TopBar.
     */
    self.close = function() {
        var i = topBar.getIndexForTab(self);
        topBar.tabs.splice(i, 1);
        topBar.$tabs.removeChild(self.$view);
        topBar.updateTabPositions();
    };

    self.$view.onclick = self.select;
}
