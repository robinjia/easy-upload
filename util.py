"""Miscellaneous utilities."""
import grp
import json
import math
import numbers
import numpy
import pwd
import re
import sys

from geventwebsocket.handler import WebSocketHandler

REQUIRED_CONFIG_ATTRIBUTES = ['title', 'text', 'write_dir']

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
    text: Description text to display on the webpage.
    write_dir: Directory to write files

  Optional fields include:
    owner: chown the created file to this username (or uid)
    group: chgrp the created file to this group (or gid)
    chmod: chmod the created file with the given code (e.g. 777)
  """
  def __init__(self, filename='config.json'):
    with open(filename) as f:
      self.obj = json.load(f)
    for attr in REQUIRED_CONFIG_ATTRIBUTES:
      if attr not in self.obj:
        raise ValueError(
            '%s missing required attribute "%s"' % (filename, attr))
    self._owner_id = self.extract_user_id()
    self._group_id = self.extract_group_id()

  def extract_user_id(self):
    if 'owner' not in self.obj: return -1
    name = self.obj['owner']
    if isinstance(name, numbers.Integral):
      return name
    else:
      return pwd.getpwnam(name).pw_uid

  def extract_group_id(self):
    if 'group' not in self.obj: return -1
    name = self.obj['group']
    if isinstance(name, numbers.Integral):
      return name
    else:
      return grp.getgrnam(name).gr_gid

  def title(self):
    return self.obj['title']

  def text(self):
    return self.obj['text']

  def write_dir(self):
    return self.obj['write_dir']

  def owner_id(self):
    return self._owner_id

  def group_id(self):
    return self._group_id

  def chmod(self):
    if 'chmod' in self.obj:
      return int(self.obj['chmod'], 8)
    return None

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

def is_valid_filename(name):
  """Checks if this is a kosher filename.
  
  Disallow navigation of filesystem with / or ..
  """
  return re.match(r'^\w[^/]*$', name) is not None
