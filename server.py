import bottle
import hashlib
import subprocess
import sys

from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketError

from handler import UploadHandler

bottle.debug(True)

app = bottle.Bottle()

@app.get('/upload/<name>')
def upload(name):
  return bottle.template('upload', title='Dror Lab')

@app.route('/static/<filepath:path>')
def serve_static(filepath):
  return bottle.static_file(filepath, root='./static')

@app.route('/websocket')
def handle_websocket():
  wsock = bottle.request.environ.get('wsgi.websocket')
  if not wsock:
    abort(400, 'Expected Websocket request.')
  
  file_contents = bytearray()
  with open('tmp_file', 'wb') as f:
    while True:
      try:
        message = wsock.receive()
        if message is None: break
        file_contents.extend(message)
        f.write(message)
        print >> sys.stderr, 'Received %d bytes' % len(message)
      except WebSocketError as e:
        print >> sys.stderr, e
        break
  md5_hash = hashlib.md5(file_contents).hexdigest()
  print >> sys.stderr, 'File Received, hash:'
  print >> sys.stderr, md5_hash
  with open('tmp_file', 'rb') as f:
    print >> sys.stderr, hashlib.md5(f.read()).hexdigest()
  subprocess.Popen(['md5sum', 'tmp_file'], )

@app.error(404)
def error404(error):
  return '<h1>404 Errror</h1>'


if __name__ == '__main__':
  hostname, port = ('localhost', 8080)
  server = WSGIServer((hostname, port), app, handler_class=UploadHandler)
  print >> sys.stderr, 'Listening on %s:%d' % (hostname, port)
  server.serve_forever()
