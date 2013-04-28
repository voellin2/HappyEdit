function Tab(pane, happyEdit) {
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

    self.$view.onclick = self.select;
}
