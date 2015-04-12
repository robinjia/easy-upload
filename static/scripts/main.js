function Uploader(id) {
  var CHUNK_SIZE = 8192;  // Read 8kB chunks

  this.div = document.getElementById(id);
  var reader = new FileReader();
  // reader.error = ;  TODO(robinjia): set this.
  var fileUpload = document.createElement("INPUT");
  fileUpload.setAttribute("type", "file");
  fileUpload.setAttribute("multiple", true);
  fileUpload.id = "files-input";
  fileUpload.onchange = function() {
    var file = fileUpload.files.item(0);
    var size = file.size;

    /* Start one file read operation */
    var curStart = 0;
    var startReadCurChunk = function() {
      if (curStart < size) {
        reader.readAsText(file.slice(curStart, curStart + CHUNK_SIZE));
      }
    }

    /* When the previous read finishes, start the next read */
    reader.onload = function(e) {
      console.log(reader.result);
      curStart += CHUNK_SIZE;
      startReadCurChunk();
    }

    /* Start the loop! */
    startReadCurChunk();

  }
  this.div.appendChild(fileUpload);
  this.fileUpload = fileUpload;
}

    /*
    for (var i = 0; i < fileUpload.files.length; i++) {
      var file = fileUpload.files.item(i);
      console.log(file);
      console.log(readBlob(file.slice(0, 3)));
      console.log(readBlob(file.slice(3, 6)));
    }
    */
