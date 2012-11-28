#!/usr/bin/env python

import shutil
import sys
import os
from string import Template

root_dir = os.path.normpath(os.path.join(os.path.dirname(__file__)))
build_dir = os.path.join(root_dir, 'build')

if os.path.exists(build_dir):
    print "Removing directory '%s'" % build_dir
    shutil.rmtree(build_dir)
os.mkdir(build_dir)

f = open(os.path.join(root_dir, 'template.html'), 'r')
template = f.read()
f.close()

targets = {
    'chrome': {
        'template_args': {
            'storageScript': 'platforms/chrome/storage.js',
            'bodyClassNames': '',
        }
    },
    'browser': {
        'template_args': {
            'storageScript': 'platforms/browser/storage.js',
            'bodyClassNames': 'hide-window-controls',
        }
    },
}

def build_target(name):
    print "## Building target '%s'" % name
    if not name in targets:
        raise Exception('Unknown target %s' % name)

    target = targets[name]
    target_dir = os.path.join(build_dir, name)

    print "Copying files into %s" % target_dir

    def ignore(dir, files):
        ret = [
            '.git',
            '.gitignore',
            '.gitmodules',
        ]
        if dir == root_dir:
            ret += [
                'make.py',
                'README.md',
                'ROADMAP.txt',
                'index.html',
                'CHANGELOG.txt',
                'build',
            ]
        elif dir == os.path.join(root_dir, 'ace'):
            ret += files
            ret.remove('build')
        return ret
    shutil.copytree(root_dir, target_dir, ignore=ignore)

    filename = os.path.join(target_dir, 'index.html')
    output = Template(template).substitute(target['template_args'])
    outfile = open(filename, 'w')
    outfile.write(output)
    outfile.close()
    print "Built " + filename

if len(sys.argv) > 1:
    build_target(sys.argv[1])
else:
    for name in targets.keys():
        build_target(name)

