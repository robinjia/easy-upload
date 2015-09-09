"""Defines the upload server."""
import bottle
import hashlib
import os
import subprocess
import sys
import time

from gevent.pywsgi import WSGIServer
from geventwebsocket import WebSocketError
from geventwebsocket.websocket import Header

import util

# bottle.debug(True)

app = bottle.Bottle()
config = util.Config()

@app.get('/upload')
def upload():
  return bottle.template('upload', title=config.title(), text=config.text())

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
  try:
    basename = wsock.receive()
    if not util.is_valid_filename(basename):
      # Abort
      return
    print >> sys.stderr, 'Receiving file "%s"' % basename
    filename = os.path.join(config.write_dir(), basename)
    with open(filename, 'wb') as f:
      while True:
        message = wsock.receive()
        if message is None: break
        f.write(message)
        bytes_received += len(message)
        wsock.send(str(bytes_received))
        print >> sys.stderr, 'Received %d bytes (%d total)' % (
            len(message), bytes_received)
  except WebSocketError as e:
    print >> sys.stderr, e
  finally:
    if config.chmod():
      os.chmod(filename, config.chmod())
    os.chown(filename, config.owner_id(), config.group_id())
    print >> sys.stderr, 'Closing websocket'
    wsock.close()
  end_time = time.time()
  print >> sys.stderr, 'Took %.3f seconds' % (end_time - start_time)
  with open(filename, 'rb') as f:
    print >> sys.stderr, hashlib.md5(f.read()).hexdigest()

@app.error(404)
def error404(error):
  return '<h1>404 Errror</h1>'


# Monkey patch geventwebsocket.websocket.Header.mask_payload() and
# geventwebsocket.websocket.Header.unmask_payload(), for efficiency
Header.mask_payload = util.mask_payload_fast
Header.unmask_payload = util.mask_payload_fast

if __name__ == '__main__':
  if len(sys.argv) == 3:
    hostname = sys.argv[1]
    port = int(sys.argv[2])
  else:
    hostname, port = ('localhost', 8080)
  server = WSGIServer((hostname, port), app, handler_class=util.UploadHandler)
  print >> sys.stderr, 'Listening on %s:%d' % (hostname, port)
  server.serve_forever()
