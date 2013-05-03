function Tab(pane, happyEdit) {
    var self = this;
    self.pane = pane;
    self.$view = HTML.createTab(pane);
    self.$title = self.$view.querySelector('.title');
    
    self.$view.onclick = function() {
        happyEdit.topBar.selectTab(self);
    };
    
    self.$view.querySelector('.close').onclick = function(event) {
        happyEdit.closePane(self.pane);
        event.stopPropagation();
    };

    pane.onChange(function(pane) {
        self.$title.innerHTML = pane.getTabLabel();
    });
}
