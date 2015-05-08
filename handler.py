from geventwebsocket.handler import WebSocketHandler

class UploadHandler(WebSocketHandler):
  """Slight modification to WebSocketHandler.

  Re-enables the logging from gevent.pywsgi.WSGIServer.
  """
  def log_request(self):
    log = self.server.log
    if log:
      log.write(self.format_request() + '\n')
