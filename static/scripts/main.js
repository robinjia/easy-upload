function Uploader(id) {
  var CHUNK_SIZE = 64 * 1024;  // Read 64kB chunks

  this.div = document.getElementById(id);

  /* Create file input field */
  var fileInput = document.createElement("INPUT");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("multiple", true);
  fileInput.id = "files-input";
  this.div.appendChild(fileInput);
  this.fileInput = fileInput;

  /* Create submit button */
  var submit = document.createElement("BUTTON");
  submit.type="button";
  submit.innerHTML = "Upload";
  submit.id = "submit-button";
  this.div.appendChild(submit)

  /* On submit, read file in chunks and send data over websocket */
  var reader = new FileReader();
  // reader.error = ;  TODO(robinjia): set this.
  submit.onclick = function() {
    var file = fileInput.files.item(0);
    var size = file.size;
    var ws = new WebSocket("ws://localhost:8080/websocket");

    /* Start one file read operation */
    var curStart = 0;
    var startReadCurChunk = function() {
      if (curStart < size) {
        reader.readAsArrayBuffer(file.slice(curStart, curStart + CHUNK_SIZE));
      } else {
        ws.close()
      }
    }

    /* When the previous read finishes, send data and start the next read */
    reader.onload = function(e) {
      ws.send(reader.result);
      curStart += CHUNK_SIZE;
      startReadCurChunk();
    }

    /* Start the loop! */
    startReadCurChunk();
  }
}

    /*
    for (var i = 0; i < fileInput.files.length; i++) {
      var file = fileInput.files.item(i);
      console.log(file);
      console.log(readBlob(file.slice(0, 3)));
      console.log(readBlob(file.slice(3, 6)));
    }
    */
