var HTML = {
    createTab: function(pane) {
        var $view = document.createElement('li');
        var $title = document.createElement('span');
        var $fader = document.createElement('span');
        var $close = document.createElement('span');
        
        $close.innerHTML = 'x';
        $view.setAttribute('rel', pane.id);
        $title.innerHTML = pane.getTabLabel();
        
        $view.setAttribute('class', 'tab');
        $title.setAttribute('class', 'title');
        $fader.setAttribute('class', 'fader');
        $close.setAttribute('class', 'close');
        
        $view.appendChild($title);
        $view.appendChild($fader);
        $view.appendChild($close);
        
        return $view;
    },
    
    createSuggestionView: function(args) {
        var $li = document.createElement('li');
        var $title = document.createElement('span');
        var $extra = document.createElement('span');
        var $shortcut = document.createElement('span');

        $title.setAttribute('class', 'title');
        $title.innerHTML = args.title,
        $li.appendChild($title);

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
        $ul.setAttribute('class', 'list-view');
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
    
    createAutoCompleteItem: function(word) {
        var $li = document.createElement('li');
        $li.setAttribute('class', 'item');
        $li.innerHTML = word;
        return $li;
    }
};
