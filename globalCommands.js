function GlobalCommandManager(happyEdit) {
    var self = this;
    var event = require("ace/lib/event");
    var HashHandler = require("ace/keyboard/hash_handler").HashHandler;
    var keyUtil = require("ace/lib/keys");
    self.handler = new HashHandler();

    event.addCommandKeyListener(window, function(e, hashId, keyCode) {
        var keyString = keyUtil.keyCodeToString(keyCode);
        var command = self.handler.findKeyCommand(hashId, keyString);
        if (command && command.exec) {
            command.exec(self);
            event.stopEvent(e);
        }
    });

    for (var i = 1; i < 10; i += 1) {
        (function() {
            var keyNum = i;
            var data = {};
            data["Ctrl-" + keyNum + "|Command-" + keyNum] = function() {
                var tabIndex = keyNum;
                if (tabIndex > happyEdit.topBar.tabs.length) {
                    tabIndex = happyEdit.topBar.tabs.length;
                }
                tabIndex -= 1;
                happyEdit.topBar.selectTabAtIndex(tabIndex);
            };
            self.handler.bindKeys(data);
        }());
    }

    self.addCommand = function(command) {
        var data = {};
        data[command.shortcut.win + '|' + command.shortcut.mac] = function() {
            // We wrap this function call because Ace sends
            // in the Editor object as the argument otherwise.
            command.callback(null, function(error) {
                if (error) {
                    // TODO display error some way.
                    console.log('Error: ', error);
                }
            });
        };
        self.handler.bindKeys(data);
    };
}
