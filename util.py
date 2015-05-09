"""Miscellaneous utilities."""
import math
import numpy
import sys

from geventwebsocket.handler import WebSocketHandler

class UploadHandler(WebSocketHandler):
  """Slight modification to WebSocketHandler.

  Re-enables the logging from gevent.pywsgi.WSGIServer.
  """
  def log_request(self):
    log = self.server.log
    if log:
      log.write(self.format_request() + '\n')


def mask_payload_fast(self, payload):
  """Monkey patch geventwebsocket.websocket.Header.mask_payload().

  Version currently in geventwebsocket does a very slow python for loop
  to mask the payload.
  
  We take advantage of numpy to do this faster.
  """
  key = (self.mask * int(math.ceil(float(len(payload))/
                                   float(len(self.mask)))))[:len(payload)]

  # Select the type size in bytes       
  if len(payload) % 8 == 0:
    dt = numpy.dtype('<Q8')
  else:
    dt = numpy.dtype('B')

  return numpy.bitwise_xor(numpy.fromstring(key, dtype=dt),
                           numpy.fromstring(payload, dtype=dt)).tostring()
