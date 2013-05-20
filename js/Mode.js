var Mode = function(mode, extensions) {
    this.mode = mode;
    this.extRe = new RegExp("^.*\\.(" + extensions.join("|") + ")$", "g");
};

Mode.prototype.supportsFile = function(filename) {
    return filename.match(this.extRe);
};

var scriptTypes = [
    {matches: /\/x-handlebars-template|\/x-mustache/i, mode: null},
    {matches: /(text|application)\/(x-)?vb(a|script)/i, mode: 'vbscript'}
];

var modes = [
    new Mode({name:'htmlmixed', scriptTypes: scriptTypes, startState: 'vbscript'}, ['html', 'htm']),
    new Mode({name:'css'}, ['css']),
    new Mode({name: 'javascript'}, ['js']),
    new Mode({name: 'python'}, ['py']),
    new Mode({name: 'php'}, ['php']),
    new Mode({name: 'ruby'}, ['ruby']),
    new Mode({name: 'markdown'}, ['markdown']),
    new Mode({name: 'go'}, ['go']),
];

function getMode(filename) {
    var mode;

    if (!filename) {
        return null;
    }

    for (var i = 0; i < window.modes.length; i += 1) {
        mode = modes[i];
        if (mode.supportsFile(filename)) {
            return mode.mode;
        }
    }

    return null;
};
