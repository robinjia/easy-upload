function Uploader(id) {
  var CHUNK_SIZE = 1024 * 1024;  // Read 1MB chunks

  var mainDiv = document.getElementById(id);

  /* Set up the button row */
  var buttonDiv = document.createElement("div");
  buttonDiv.style.marginBottom = "20px";
  mainDiv.appendChild(buttonDiv);

  /* Create file input field */
  var fileDiv = document.createElement("div");
  fileDiv.innerHTML = "<span>Choose File</span>";
  fileDiv.className = "btn btn-primary file-upload";
  var fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  // fileInput.setAttribute("multiple", true);
  fileInput.className = "upload";
  fileDiv.appendChild(fileInput)
  buttonDiv.appendChild(fileDiv);

  /* Create submit button */
  var submit = document.createElement("button");
  submit.type="button";
  submit.innerHTML = "Start Upload";
  submit.id = "submit-button";
  submit.className = "btn btn-primary";
  submit.style.display = "none";
  buttonDiv.appendChild(submit);

  /* Create field to display filename */
  var filenameDisplay = document.createElement("p");
  filenameDisplay.style.display = "none";
  mainDiv.appendChild(filenameDisplay);

  fileInput.onchange = function() {
    var fileList = fileInput.files;
    console.log(fileList);
    if (fileList.length == 0) {
      submit.style.display = "none";
      filenameDisplay.style.display = "none";
    } else {
      submit.style.display = "inline";
      filenameDisplay.style.display = "block";
      console.log(fileList.item(0));
      $(filenameDisplay).text("Chosen file: " + fileList.item(0).name);
    }
  }

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
