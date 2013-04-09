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

    createDirectoryView: function(dir, key) {
        var $ul = document.createElement('ul');
        var file;
        var $li;
        var $icon;
        var $title;
        var count = 0;
        var i = 0;

        $ul.setAttribute('rel', key);

        for (i = 0; i < dir.directories.length; i += 1) {
            file = dir.directories[i];

            $li = document.createElement('li');
            $li.setAttribute('class', 'directory item' + String(count));
            $li.setAttribute('rel', file);

            $title = document.createElement('span');
            $title.setAttribute('class', 'title');
            $title.innerHTML = file;

            $icon = document.createElement('span');
            $icon.setAttribute('class', 'icon');

            if (file[0] === '.') {
                Utils.addClass($li, 'hidden');
            }

            $li.appendChild($title);
            $li.appendChild($icon);
            $ul.appendChild($li);

            count += 1;
        }

        for (i = 0; i < dir.files.length; i += 1) {
            file = dir.files[i];

            $li = document.createElement('li');
            $li.setAttribute('class', 'file item' + String(count));
            $li.setAttribute('rel', file);

            $title = document.createElement('span');
            $title.setAttribute('class', 'title');
            $title.innerHTML = file;

            if (file[0] === '.') {
                Utils.addClass($li, 'hidden');
            }

            $li.appendChild($title);
            $ul.appendChild($li);

            count += 1;
        }

        return $ul;
    },

    createGrepListItem: function(model) {
        var $li = document.createElement('li');
        $li.innerHTML = model.filename + '(' + model.lineNumber + ')' + ' ' + model.snippet;
        return $li;
    },

    createStartScreenProjectItem: function(model) {
        var $li = document.createElement('li');
        $li.innerHTML = model.name || model.host;
        return $li;
    },

    fillAutoCompleteList: function($ul, data) {
        var count = 0;
        data.forEach(function(word, i) {
            var $li = document.createElement('li');
            $li.setAttribute('class', 'item' + String(count));
            $li.innerHTML = word;
            $ul.appendChild($li);
            count += 1;
        });
    }
};
