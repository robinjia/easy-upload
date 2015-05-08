import bottle
import hashlib
import subprocess
import sys
import time

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
  start_time = time.time()
  wsock = bottle.request.environ.get('wsgi.websocket')
  if not wsock:
    abort(400, 'Expected Websocket request.')
  
  bytes_received = 0
  with open('/tmp/websocket.tmp', 'wb') as f:
    while True:
      try:
        message = wsock.receive()
        if message is None: break
        f.write(message)
        bytes_received += len(message)
        print >> sys.stderr, 'Received %d bytes (%d total)' % (
            len(message), bytes_received)
      except WebSocketError as e:
        print >> sys.stderr, e
        break
  end_time = time.time()
  print >> sys.stderr, 'Took %.3f seconds' % (end_time - start_time)
  with open('/tmp/websocket.tmp', 'rb') as f:
    print >> sys.stderr, hashlib.md5(f.read()).hexdigest()
  subprocess.Popen(['md5sum', '/tmp/websocket.tmp'])

@app.error(404)
def error404(error):
  return '<h1>404 Errror</h1>'


if __name__ == '__main__':
  hostname, port = ('localhost', 8080)
  server = WSGIServer((hostname, port), app, handler_class=UploadHandler)
  print >> sys.stderr, 'Listening on %s:%d' % (hostname, port)
  server.serve_forever()
