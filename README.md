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

## Initial setup
Before you can run the server, you need to set basic configuration parameters.
Configuration is handled through a single JSON file
located at `config.json` in the root directory.
See `config_example.json` for an example config file.

Currently, the following parameters can be configured:
* title (required): Title of the webpage
* text (required): Text to display on the webpage
* write\_dir (required): Location to write uploaded files
* owner: If supplied, chown file to supplied user or uid
* group: If supplied, chgrp file to supplied group or gid
* chmod: If supplied, chmod file to the supplied permission level

## Running
To start the server, simply run

    python server.py

By default, this will run on localhost on port 8080.
You can also specify a certain hostname and port; for example,

    python server.py 0.0.0.0 3000

will run on 0.0.0.0 on port 3000.
