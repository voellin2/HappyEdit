#!/usr/bin/env python

import sys
import os
import mimetypes
import json
from os.path import expanduser
from hashlib import md5
from urlparse import parse_qsl
from urllib import unquote
from wsgiref.simple_server import make_server

PROTOCOL_VERSION = "0.1"

class FileListing():

    def get_project_files(self, project):
        tree = {}

        ignored_directories = project.get('ignoredDirectories', [])
        ignored_extensions = project.get('ignoredExtensions', [])

        for dirpath, dirnames, filenames in os.walk(project['path']):
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

    def __call__(self, environ, start_response):
        if not environ['PATH_INFO'] in ['/files', '/files/']:
            return self.next_handler(environ, start_response)

        response = json.dumps(self.get_project_files(environ['PROJECT']))

        start_response("200 OK", [
            ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(response))),
        ])
        return [response]

class FileHandler():

    def GET(self, environ, start_response, filename):
        start_response("200 OK", [
            ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', mimetypes.guess_type(filename)[0] or 'text/plain'),
            ('Content-Length', str(os.path.getsize(filename))),
        ])
        return [open(filename, 'rb').read()]

    def POST(self, environ, start_response, filename):
        length = int(environ['CONTENT_LENGTH'])
        params = dict(parse_qsl(environ['wsgi.input'].read(length)))
        open(filename, 'w').write(params.get('body', ''))
        msg = 'File "%s" saved' % filename
        start_response("200 OK", [
            ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(msg))),
        ])
        return [msg]

    def DELETE(self, environ, start_response, filename):
        os.remove(filename)
        msg = 'File "%s" deleted' % filename
        start_response("200 OK", [
            ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(msg))),
        ])
        return [msg]

    def __call__(self, environ, start_response):
        if not environ['PATH_INFO'].startswith('/files'):
            return self.next_handler(environ, start_response)

        project_path = environ['PROJECT']['path']
        filename = os.path.join(project_path, environ['PATH_INFO'][7:])
        filename = os.path.realpath(filename)
        
        # The file must be under the cwd
        if not os.path.realpath(filename).startswith(project_path):
            print "Forbidden attempt to access file %s (path does not start with %s)" % (filename, project_path)
            msg = 'Forbidden'
            start_response("403 Forbidden", [
                ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
                ('Access-Control-Allow-Origin', '*'),
                ('Content-Type', 'text/plain'),
                ('Content-Length', str(len(msg))),
            ])
            return [msg]

        if environ['REQUEST_METHOD'] == 'GET':
            return self.GET(environ, start_response, filename)
        if environ['REQUEST_METHOD'] == 'POST':
            return self.POST(environ, start_response, filename)
        if environ['REQUEST_METHOD'] == 'DELETE':
            return self.DELETE(environ, start_response, filename)

class NotFoundHandler:

    def __call__(self, environ, start_response):
        msg = "404 Not Found"
        start_response("200 OK", [
            ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
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
                    ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
                    ('Access-Control-Allow-Origin', '*'),
                    ('Content-Type', 'text/plain'),
                    ('Content-Length', str(len(msg))),
                ])
                return [msg]
            else:
                msg = "Incorrect password"
                start_response("401 Unauthorized", [
                    ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
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
                ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
                ('Access-Control-Allow-Origin', '*'),
                ('Content-Type', 'text/plain'),
                ('Content-Length', str(len(msg))),
            ])
            return [msg]
        return self.next_handler(environ, start_response)

def load_settings():
    home = expanduser("~")
    filepath = os.path.join(home, '.happyedit.json')

    cfg = {
        "password": "",
        "projects": [],
    }

    if os.path.exists(filepath):
        try:
            f = open(filepath)
            project_cfg = json.loads(f.read())
            cfg.update(project_cfg)
            f.close()
        except Exception as e:
            print e
    else:
        f = open(filepath, 'w')
        f.write(json.dumps(cfg, sort_keys=True, indent=4))
        f.close()

    if not cfg['password']:
        print cfg
        raise Exception("You must set a password in " + filepath)

    if len(cfg['projects']) == 0:
        raise Exception("You must configure at least one project in " + filepath)

    return cfg

class ProjectFinder:

    def __init__(self, cfg):
        self.cfg = cfg

    def __call__(self, environ, start_response):
        # TODO: locate project based on start of environ['PATH']
        project = self.cfg['projects'][0]
        project['path'] = os.path.realpath(project['path'])
        environ['PROJECT'] = project
        return self.next_handler(environ, start_response)

def main():
    cwd = os.getcwd()

    cfg = load_settings()

    handlers = []
    handlers.append(ConnectHandler(cfg))
    handlers.append(PermissionHandler(cfg))
    handlers.append(ProjectFinder(cfg))
    handlers.append(FileListing())
    handlers.append(FileHandler())
    handlers.append(NotFoundHandler())

    i = 0
    for handler in handlers:
        i += 1
        if i < len(handlers):
            handler.next_handler = handlers[i]
            
    host = 'localhost';
    port = 8888
    
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
        
    try:
        print "Serving " + cwd + " to http://%s:%s" % (host, port)
        make_server(host, port, handlers[0]).serve_forever()
    except KeyboardInterrupt, ki:
        print "\nBye bye"

if __name__ == '__main__':
    main()

