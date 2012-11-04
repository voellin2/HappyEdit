var Mode = function(name, desc, clazz, extensions) {
    this.name = name;
    this.desc = desc;
    this.clazz = clazz;
    this.mode = new clazz();
    this.mode.name = name;
    this.extRe = new RegExp("^.*\\.(" + extensions.join("|") + ")$", "g");
};

Mode.prototype.supportsFile = function(filename) {
    return filename.match(this.extRe);
};

var modes = [
    new Mode("text", "Text", require("ace/mode/text").Mode, ["txt"]),
    new Mode("html", "HTML", require("ace/mode/html").Mode, ["html", "htm"]),
    new Mode("css", "CSS", require("ace/mode/css").Mode, ["css"]),
    new Mode("javascript", "JavaScript", require("ace/mode/javascript").Mode, ["js"]),
    new Mode("json", "JSON", require("ace/mode/json").Mode, ["json"]),
    new Mode("python", "Python", require("ace/mode/python").Mode, ["py"]),
    new Mode("php", "PHP",require("ace/mode/php").Mode, ["php"]),
    new Mode("text", "Text", require("ace/mode/text").Mode, ["txt"]),
    new Mode("diff", "Diff", require("ace/mode/diff").Mode, ["diff"])
];
