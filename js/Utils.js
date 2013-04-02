var Utils = {
    trim: function(s) {
        return s.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
    
    moveX: function($elem, x) {
        $elem.style.webkitTransform = 'translateX(' +  x + 'px)';
        $elem.style.MozTransform = 'translateX(' +  x + 'px)';
        $elem.x = x;
    },

    /**
     * Extend d1 with the values of d2.
     */
    extend: function(d1, d2) {
        var key;
        for (key in d2) {
            if (d2.hasOwnProperty(key)) {
                d1[key] = d2[key];
            }
        }
        return d1;
    },

    /**
     * Does s1 start with s2?
     */
    startsWith: function(s1, s2) {
        return s1.substring(0, s2.length) === s2;
    },

    getShortcutForCommand: function(command) {
        var os = getMacOrWin();
        var shortcut = null;
    
        if (command.shortcut && command.shortcut.hasOwnProperty(os)) {
            shortcut = command.shortcut[os];
            shortcut = shortcut.replace('-', '');
            shortcut = shortcut.replace('Command', '⌘');
            shortcut = shortcut.replace('Shift', '⇧');
        }
    
        return shortcut;
    }
};

function addClass(elem, className) {
    if (!elem) {
        return;
    }

    var i;
    var classNames = elem.getAttribute('class') || '';
    classNames = classNames.split(' ');

    for (i = 0; i < classNames.length; i += 1) {
        if (classNames[i] === className) {
            return;
        }
    }

    classNames.push(className);
    elem.setAttribute('class', classNames.join(' '));
}

function hasClass(elem, className) {
    if (!elem) {
        return;
    }

    var i;
    var classNames = elem.getAttribute('class') || '';
    classNames = classNames.split(' ');

    for (i = 0; i < classNames.length; i += 1) {
        if (classNames[i] === className) {
            return true;
        }
    }

    return false;
}

function capFileName(filename, max) {
    var ret = filename;

    if (filename.length > max) {
        var split = filename.split('/');
        if (split.length > 1) {
            var last = split.pop();
            ret = split.join('/').substring(0, max - split[1].length - 4) + '.../' + split[1] + last;
        } else {
            ret = filename.substring(0, max-3) + '...';
        }
    }

    return ret;
}

function removeClass(elem, className) {
    if (!elem) {
        return;
    }

    var i;
    var newClassNames = [];
    var classNames = elem.getAttribute('class') || '';
    classNames = classNames.split(' ');

    for (i = 0; i < classNames.length; i += 1) {
        if (classNames[i] != className) {
            newClassNames.push(classNames[i]);
        }
    }

    elem.setAttribute('class', newClassNames.join(' '));
}

function isNumeric(num) {
    return parseFloat(num).toString() == num;
}

/**
 * Returns if OS is "windows", "mac", "unix" or "linux". Default: "windows".
 */
function getOS() {
    var os = "win";
    if (navigator.appVersion.indexOf("Win")!=-1) os = "windows";
    if (navigator.appVersion.indexOf("Mac")!=-1) os = "mac";
    if (navigator.appVersion.indexOf("X11")!=-1) os = "unix";
    if (navigator.appVersion.indexOf("Linux")!=-1) os = "linux";
    return os;
}

function getMacOrWin() {
    if (getOS() === "mac") {
        return "mac";
    }
    return "win";
}
