var HTML = {
    createSuggestionView: function(args) {
        var $li = document.createElement('li');
        var $title = document.createElement('span');
        var $extra = document.createElement('span');
        var $shortcut = document.createElement('span');

        $title.setAttribute('class', 'title');
        $title.innerHTML = args.title,
        $li.appendChild($title);
        $li.setAttribute('rel', args.rel);
        $li.setAttribute('title', args.rel);
        $li.onclick = args.onclick;

        if (args.extra) {
            $extra.setAttribute('class', 'extra');
            $extra.innerHTML = args.extra;
            $li.appendChild($extra);
        }

        if (args.shortcut) {
            $shortcut.setAttribute('class', 'shortcut');
            $shortcut.innerHTML = args.shortcut;
            $li.appendChild($shortcut);
        }

        return $li;
    },

    createMenuOption: function(args) {
        var callback = args.callback;
        var $li = document.createElement('li');
        var $title = document.createElement('span');
        var $shortcut = document.createElement('span');

        $li.setAttribute('class', args.className);

        $title.setAttribute('class', 'title');
        $title.innerHTML = args.title,
        $li.appendChild($title);
        $li.setAttribute('rel', args.rel);
        $li.onclick = function() {
            callback();
            window.happyEdit.menu.hide();
        };

        if (args.shortcut) {
            $shortcut.setAttribute('class', 'shortcut');
            $shortcut.innerHTML = args.shortcut;
            $li.appendChild($shortcut);
        }

        return $li;
    },

    createExplorer: function(args) {
        var $explorer= document.createElement('div');
        var $ul= document.createElement('ul');
        $explorer.setAttribute('class', 'explorer');

        var i = 0;
        for (i = 0; i < args.files.length; i += 1) {
            var file = args.files[i];
            var $li = document.createElement('li');
            $li.setAttribute('class', 'file' + String(i));
            $li.innerHTML = file;
            $ul.appendChild($li);
        }

        $explorer.appendChild($ul);
        return $explorer;
    }
};
