"""Miscellaneous utilities."""
import json
import math
import numpy
import sys

from geventwebsocket.handler import WebSocketHandler

REQUIRED_CONFIG_ATTRIBUTES = ['title', 'write_dir']

class UploadHandler(WebSocketHandler):
  """Slight modification to WebSocketHandler.

  Re-enables the logging from gevent.pywsgi.WSGIServer.
  """
  def log_request(self):
    log = self.server.log
    if log:
      log.write(self.format_request() + '\n')

class Config(object):
  """Handles server configuration.

  Configuration is stored in config.json.
  This should be a json file with the following fields:

    title: Intended website title
    write_dir: Directory to write files
  """
  def __init__(self, filename='config.json'):
    with open(filename) as f:
      self.obj = json.load(f)
    for attr in REQUIRED_CONFIG_ATTRIBUTES:
      if attr not in self.obj:
        raise ValueError(
            '%s missing required attribute "%s"' % (filename, attr))

  def title(self):
    return self.obj['title']

  def write_dir(self):
    return self.obj['write_dir']


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
