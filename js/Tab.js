function Tab(pane, topBar, happyEdit) {
    var self = this;
    this.pane = pane;
    this.$title = document.createElement('span');
    this.$title.innerHTML = pane.getTabLabel();
    this.$fader = document.createElement('span');
    this.$fader.setAttribute('class', 'fader');
    this.$view = document.createElement('li');
    this.$view.setAttribute('class', 'tab');
    this.$view.appendChild(this.$title);
    this.$view.appendChild(this.$fader);
    this.$view.setAttribute('rel', pane.id);

    pane.onChange(function(pane) {
        self.$title.innerHTML = pane.getTabLabel();
    });

    this.select = function() {
        if (topBar.selectedTab) {
            Utils.removeClass(topBar.selectedTab.$view, 'selected');
        }

        Utils.addClass(self.$view, 'selected');
        topBar.selectedTab = self;

        if (self.pane !== happyEdit.currentPane) {
            happyEdit.switchPane(self.pane, false);
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
            if (closestSibling) {
                closestSibling.select();
            }
        }
        topBar.tabs.splice(i, 1);
        topBar.$tabs.removeChild(this.$view);
        topBar.updateTabPositions();
    };

    this.$view.onclick = this.select;
}
