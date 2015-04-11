import bottle

bottle.debug(True)

app = bottle.Bottle()

@app.get('/upload/<name>')
def upload(name):
  return bottle.template('upload', title='Dror Lab')

@app.route('/static/<filepath:path>')
def serve_static(filepath):
  return bottle.static_file(filepath, root='./static')

@app.error(404)
def error404(error):
  return '<h1>404 Errror</h1>'

bottle.run(app, host='localhost', port=8080)
