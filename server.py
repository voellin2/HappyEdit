#!/usr/bin/env python

import sys
import os
import mimetypes
import json
import re
from os.path import expanduser
from hashlib import md5
from urlparse import parse_qsl
from urllib import unquote
from wsgiref.simple_server import make_server

PROTOCOL_VERSION = "0.1"

def get_project_by_id(cfg, project_id):
    for project in cfg['projects']:
        if project['id'] == project_id:
            return project

class FileListing():
    
    def __init__(self, cfg):
        self.cfg = cfg
        self.regexp = re.compile(r'/(.*)/files$')

    def get_project_files(self, project):
        tree = {}

        ignored_directories = project.get('ignoredDirectories', [])
        ignored_extensions = project.get('ignoredExtensions', [])

        project_path = os.path.realpath(project['path'])

        strip_length = len(project_path) + 1

        for dirpath, dirnames, filenames in os.walk(project_path):
            rel_dirpath = dirpath[strip_length:]

            if rel_dirpath == '':
                rel_dirpath = '.'

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

            tree[rel_dirpath] = {
                'directories': dirnames,
                'files': files,
            }

        return tree

    def __call__(self, environ, start_response):
        match = self.regexp.match(environ['PATH_INFO'])
        
        if not match:
            return self.next_handler(environ, start_response)
            
        groups = match.groups()
        project = get_project_by_id(self.cfg,  groups[0])
            
        response = json.dumps(self.get_project_files(project))

        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(response))),
        ])
        return [response]

class FileHandler():
    
    def __init__(self, cfg):
        self.cfg = cfg
        self.regexp = re.compile(r'/(.*)/files/(.*)')

    def GET(self, environ, start_response, filename):
        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', mimetypes.guess_type(filename)[0] or 'text/plain'),
            ('Content-Length', str(os.path.getsize(filename))),
        ])
        return [open(filename, 'rb').read()]

    def POST(self, environ, start_response, filename):
        length = int(environ['CONTENT_LENGTH'])
        params = dict(parse_qsl(environ['wsgi.input'].read(length)))
        body = params.get('body', '')

        print "Saving %s" % filename

        f = open(filename, 'w')
        f.write(body)
        f.close()

        msg = 'File "%s" saved' % filename
        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(msg))),
        ])
        return [str(msg)]

    def DELETE(self, environ, start_response, filename):
        os.remove(filename)
        msg = 'File "%s" deleted' % filename
        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(msg))),
        ])
        return [str(msg)]

    def OPTIONS(self, environ, start_response, filename):
        msg = ''
        start_response("200 OK", [
            ('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'),
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'text/plain'),
            ('Content-Length', str(len(msg))),
        ])
        return [msg]

    def __call__(self, environ, start_response):
        match = self.regexp.match(environ['PATH_INFO'])
        
        if not match:
            return self.next_handler(environ, start_response)
            
        groups = match.groups()
        project = get_project_by_id(self.cfg,  groups[0])
        project_path = os.path.realpath(project['path'])

        filename = groups[1]
        filename = os.path.join(project_path, filename)
        filename = os.path.realpath(filename)

        # The file must be under the project directory
        if not filename.startswith(project_path):
            print "Forbidden attempt to access file %s (path does not start with %s)" % (filename, project_path)
            msg = 'Forbidden'
            start_response("403 Forbidden", [
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
        if environ['REQUEST_METHOD'] == 'OPTIONS':
            return self.DELETE(environ, start_response, filename)

class NotFoundHandler:

    def __call__(self, environ, start_response):
        msg = "404 Not Found"
        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'text/plain'),
            ('Content-Length', str(len(msg))),
        ])
        return [msg]

class LoginHandler:

    def __init__(self, cfg):
        self.cfg = cfg

    def __call__(self, environ, start_response):
        if environ['REQUEST_METHOD'] == 'POST' and environ['PATH_INFO'] == '/login':
            length = int(environ['CONTENT_LENGTH'])
            params = dict(parse_qsl(environ['wsgi.input'].read(length)))
            user = params.get('user')
            password = params.get('password')
            if user == self.cfg['user'] and password == self.cfg['password']:
                msg = json.dumps({
                    'authToken': md5(password).hexdigest()
                })
                start_response("200 OK", [
                    ('Access-Control-Allow-Origin', '*'),
                    ('Content-Type', 'application/json'),
                    ('Content-Length', str(len(msg))),
                ])
                return [msg]
            else:
                msg = "Incorrect user or password"
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

def load_settings():
    home = expanduser("~")
    filepath = os.path.join(home, '.happyedit.json')

    cfg = {
        "host": "localhost",
        "port": "8888",
        "user": "",
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

    if not cfg['user']:
        raise Exception("You must set a user in " + filepath)

    if not cfg['password']:
        raise Exception("You must set a password in " + filepath)

    if len(cfg['projects']) == 0:
        raise Exception("You must configure at least one project in " + filepath)

    for project in cfg['projects']:
        project['id'] = md5(project['path']).hexdigest()

    return cfg

class ProjectsListing:

    def __init__(self, cfg):
        self.cfg = cfg

    def __call__(self, environ, start_response):
        if not (environ['REQUEST_METHOD'] == 'GET' and environ['PATH_INFO'] == '/projects'):
            return self.next_handler(environ, start_response)
        
        projects = []
        
        for project in self.cfg['projects']:
            projects.append({
                'id': project['id'],
                'title': project['title'],
            })
        
        response = json.dumps(projects)

        start_response("200 OK", [
            ('Access-Control-Allow-Origin', '*'),
            ('Content-Type', 'application/json'),
            ('Content-Length', str(len(response))),
        ])
        
        return [response]

def main():
    cwd = os.getcwd()

    cfg = load_settings()

    handlers = []
    handlers.append(LoginHandler(cfg))
    handlers.append(PermissionHandler(cfg))
    handlers.append(ProjectsListing(cfg))
    handlers.append(FileListing(cfg))
    handlers.append(FileHandler(cfg))
    handlers.append(NotFoundHandler())

    i = 0
    for handler in handlers:
        i += 1
        if i < len(handlers):
            handler.next_handler = handlers[i]
            
    host = cfg['host']
    port = int(cfg['port'])

    try:
        print "Serving " + cwd + " to http://%s:%s" % (host, port)
        make_server(host, port, handlers[0]).serve_forever()
    except KeyboardInterrupt, ki:
        print "\nBye bye"

if __name__ == '__main__':
    main()

