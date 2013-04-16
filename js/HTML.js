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

    createExplorerItem: function(model) {
        var $li;
        var $icon;
        var $title;
        
        $li = document.createElement('li');
        $li.setAttribute('class', 'item ' + model.type);

        $title = document.createElement('span');
        $title.setAttribute('class', 'title');
        $title.innerHTML = model.filename;
        $li.appendChild($title);

        if (model.type === 'directory') {
            $icon = document.createElement('span');
            $icon.setAttribute('class', 'icon');
            $li.appendChild($icon);
        }

        if (model.filename[0] === '.') {
            Utils.addClass($li, 'hidden');
        }

        return $li;
    },
    
    createDirectoryView: function(dir) {
        var $ul = document.createElement('ul');
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
