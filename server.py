#!/usr/bin/env python

import sys
import os
import mimetypes
import json
from hashlib import md5
from urlparse import parse_qsl
from urllib import unquote
from wsgiref.simple_server import make_server

PROTOCOL_VERSION = "0.1"

class File:

    def __init__(self, path):
        self.path = path

    def __call__(self, environ, start_response):
        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', mimetypes.guess_type(self.path)[0] or 'text/plain'),
            ('Content-Length', str(os.path.getsize(self.path))),
        ])
        return [open(self.path, 'rb').read()]

class Directory(dict):

    def __init__(self, path):
        self.path = path
        self.load()

    def load(self):
        self.clear()
        for child in os.listdir(self.path):
            childpath = os.path.join(self.path, child)
            if os.path.isdir(childpath):
                self[child] = Directory(childpath)
            else:
                self[child] = File(childpath)

    def __getitem__(self, key):
        self.load()
        return dict.__getitem__(self, key)

    def notfound(self, part, environ, start_response):
        msg =  part + ' not found in ' + repr(self)
        start_response("404 Not Found", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'text/plain'),
            ('Content-Length', str(len(msg))),
        ])
        return [msg]

    def __call__(self, environ, start_response):
        parts = [i for i in environ['PATH_INFO'].split('/') if i != '']
        obj = self
        for part in parts:
            if part not in obj:
                return self.notfound(part, environ, start_response)
            obj = obj[part]
        return obj(environ, start_response)

    def __repr__(self):
        return self.path

def get_project_files(project_path, cfg):
    tree = {}

    ignored_directories = cfg['ignoredDirectories']
    ignored_extensions = cfg['ignoredExtensions']

    for dirpath, dirnames, filenames in os.walk(project_path):
        for dirname in ignored_directories:
            if dirname in dirnames:
                dirnames.remove(dirname)

        for dirname in dirnames:
            if dirname.startswith('.'):
                dirnames.remove(dirname)

        files = []
        for filename in filenames:
            ext = os.path.splitext(filename)[1]
            if not ext in ignored_extensions:
                files.append(filename)

        tree[os.path.relpath(dirpath)] = {
            'directories': dirnames,
            'files': files,
        }

    return tree

class FileListing():

    def __init__(self, path, cfg):
        self.cfg = cfg
        self.path = path
        self.next_handler = None

    def __call__(self, environ, start_response):
        if environ['PATH_INFO'] in ['/files', '/files/']:
            params = dict(parse_qsl(environ['QUERY_STRING']))
            response = json.dumps(get_project_files(self.path, self.cfg))
            start_response("200 OK", [
                ('Access-Control-Allow-Origin', '*'),
                ('Content-Type', 'application/json'),
                ('Content-Length', str(len(response))),
            ])
            return [response]
        return self.next_handler(environ, start_response)

class SaveHandler():

    def __init__(self, path):
        self.path = path
        self.next_handler = None

    def __call__(self, environ, start_response):
        if environ['REQUEST_METHOD'] == 'POST' and environ['PATH_INFO'].startswith('/files'):
            filename = self.path + os.path.sep + os.path.join(environ['PATH_INFO'][7:])
            # The file must be under the cwd
            if self.path not in os.path.realpath(filename):
                msg = 'Forbidden'
                start_response("403 Forbidden", [
                    ('Access-Control-Allow-Origin', '*'),
                    ('Content-Type', 'text/plain'),
                    ('Content-Length', str(len(msg))),
                ])
                return [msg]
            length = int(environ['CONTENT_LENGTH'])
            params = dict(parse_qsl(environ['wsgi.input'].read(length)))
            open(filename, 'w').write(params.get('body', ''))
            msg = 'File "%s" saved' % filename
            start_response("200 OK", [
                ('Access-Control-Allow-Origin', '*'),
                ('Content-Type', 'application/json'),
                ('Content-Length', str(len(msg))),
            ])
            return [msg]
        return self.next_handler(environ, start_response)

class ProjectFilesServer(Directory):

    def __call__(self, environ, start_response):
        if environ['REQUEST_METHOD'] == 'GET' and environ['PATH_INFO'].startswith('/files/'):
            environ['PATH_INFO'] = environ['PATH_INFO'][7:]
            return Directory.__call__(self, environ, start_response)
        return self.next_handler(environ, start_response)

class NotFoundHandler:

    def __call__(self, environ, start_response):
        msg = "404 Not Found"
        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'text/plain'),
            ('Content-Length', str(len(msg))),
        ])
        return [msg]

class ConnectHandler:

    def __init__(self, cfg):
        self.cfg = cfg

    def __call__(self, environ, start_response):
        if environ['REQUEST_METHOD'] == 'POST' and environ['PATH_INFO'] == '/connect':
            length = int(environ['CONTENT_LENGTH'])
            params = dict(parse_qsl(environ['wsgi.input'].read(length)))
            password = params.get('password')
            if password == self.cfg['password']:
                msg = json.dumps({
                    'authToken': md5(password).hexdigest()
                })
                start_response("200 OK", [
                    ('Access-Control-Allow-Origin', '*'),
                    ('Content-Type', 'text/plain'),
                    ('Content-Length', str(len(msg))),
                ])
                return [msg]
            else:
                msg = "Incorrect password"
                start_response("401 Unauthorized", [
                    ('Access-Control-Allow-Origin', '*'),
                    ('Content-Type', 'text/plain'),
                    ('Content-Length', str(len(msg))),
                ])
                return [msg]
        return self.next_handler(environ, start_response)

class PermissionHandler:

    def __init__(self, cfg):
        self.cfg = cfg

    def __call__(self, environ, start_response):
        params = dict(parse_qsl(environ['QUERY_STRING']))
        if params.get('token') != md5(self.cfg['password']).hexdigest():
            msg = "Incorrect authToken"
            start_response("401 Unauthorized", [
                ('Access-Control-Allow-Origin', '*'),
                ('Content-Type', 'text/plain'),
                ('Content-Length', str(len(msg))),
            ])
            return [msg]
        return self.next_handler(environ, start_response)

def load_settings(path):
    filepath = os.path.join(path, '.happyedit.json')

    cfg = {
        'password': None,
        'ignoredDirectories': [],
        'ignoredExtensions': [],
    }

    if os.path.exists(filepath):
        try:
            f = open(filepath)
            project_cfg = json.loads(f.read())
            f.close()
            cfg.update(project_cfg)
        except Exception as e:
            print e
    else:
        f = open(filepath, 'w')
        f.write(json.dumps(cfg, sort_keys=True, indent=4))
        f.close()

    if not cfg['password']:
        raise Exception("You must set a password in " + filepath)

    return cfg

def main():
    cwd = os.getcwd()

    cfg = load_settings(cwd)

    handlers = []
    handlers.append(ConnectHandler(cfg))
    handlers.append(PermissionHandler(cfg))
    handlers.append(FileListing(cwd, cfg))
    handlers.append(SaveHandler(cwd))
    handlers.append(ProjectFilesServer(cwd))
    handlers.append(NotFoundHandler())

    i = 0
    for handler in handlers:
        i += 1
        if i < len(handlers):
            handler.next_handler = handlers[i]
            
    host = 'localhost';
    port = 8888
    
    if len(sys.argv) > 0:
        port = int(sys.argv[1])
        
    try:
        print "Serving " + cwd + " to http://%s:%s" % (host, port)
        make_server(host, port, handlers[0]).serve_forever()
    except KeyboardInterrupt, ki:
        print "\nBye bye"

if __name__ == '__main__':
    main()

