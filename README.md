# Easy Upload
A simple web application for transferring very large files 
over the network using WebSocket.

## Feature Overview
* Informative client-side UI
* Encryption of data stream with SSL
* Easy-to-configure uploader authentication

## Motivation
Research collaborations typically require the transfer of data from one group to another.
These datasets can be gigabytes, or even hundreds of gigabytes in size.
To date, there is no good tool for transferring this much data over the network.

If the receiving party trusted their collaborators, they could give them
ssh access to a cluster, and tell them to transfer their data via scp.
However, it is usually not practical to grant such server access to collaborators.
Additionally, the sending party will often be an experimental lab,
and may not be familiar with unix command line tools.

File sharing companies like Box and Dropbox offer some help,
but tend to impose finicky limitations.
Box has a nice third-party upload feature, but it limits file sizes
to 5GB, and its UI is lacking.  It also provides
very little ability to customize, e.g. to add authentication.
Dropbox requires both parties in a shared folder to have sufficient
Dropbox space, which is problematic when more than a few GB of data
needs to be shared.

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
