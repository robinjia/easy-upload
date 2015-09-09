# Easy Upload
A simple web application for transferring very large files 
over the network using WebSocket.

This app allows research collaborators to share large files,
without requiring all parties to have an account on a file sharing service
like Dropbox.

# Setup
## Requirements
* [Bottle](http://bottlepy.org/docs/dev/index.html)
* [gevent](http://www.gevent.org/)
* [gevent-websocket](https://pypi.python.org/pypi/gevent-websocket/)
  * Note: gevent-websocket recommends installing
[wsaccel](https://github.com/methane/wsaccel) and 
[ujson](https://pypi.python.org/pypi/ujson)
* [numpy](http://www.numpy.org/)

Most of these are available in pip, i.e.

    pip install bottle gevent gevent-websocket wsaccel ujson

Numpy installation instructions can be found
on the [scipy website](http://www.scipy.org/scipylib/download.html).
