function Uploader(id) {
  this.CHUNK_SIZE = 1024 * 1024;  // Read 1MB chunks
  this.mainDiv = document.getElementById(id);
  this.reader = new FileReader();
  // this.reader.error = ;  TODO(robinjia): set this.
}

Uploader.prototype.render = function() {
  var uploader = this;
  var CHUNK_SIZE = this.CHUNK_SIZE;
  var mainDiv = this.mainDiv;
  var reader = this.reader;

  var buttonRow = this.createButtonRow();
  var fileInput = this.createFileInput(buttonRow);
  var submit = this.createSubmitButton(buttonRow);
  var filenameDisplay = this.createFilenameDisplay();

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
  submit.onclick = function() {
    var fileInputParent = fileInput.parentNode;
    fileInputParent.setAttribute("class", fileInputParent.className + " disabled");
    submit.setAttribute("class", submit.className + " disabled");
    var file = fileInput.files.item(0);
    var fileSize = file.size;
    var ws = new WebSocket("ws://" + location.host + "/websocket");
    console.log("Buffered amount: " + ws.bufferedAmount);
    var progressOuterDiv = document.createElement("div");
    var progressBar = new ProgressBar(progressOuterDiv, fileSize);
    mainDiv.appendChild(progressOuterDiv);

    /* Start one file read operation */
    var curStart = 0;
    var startReadCurChunk = function() {
      if (curStart < fileSize) {
        reader.readAsArrayBuffer(file.slice(curStart, curStart + CHUNK_SIZE));
      } else {
        // progressBar.updateValue(fileSize);
        // console.log("Buffered amount: " + ws.bufferedAmount);
      }
    }

    /* When the previous read finishes, send data and start the next read */
    reader.onload = function(e) {
      ws.send(reader.result);
      // progressBar.updateValue(curStart);
      curStart += CHUNK_SIZE;
      startReadCurChunk();
    }

    /* Update progress bar when the server signals that it has received data. */
    ws.onmessage = function(e) {
      var curBytes = parseInt(e.data);
      progressBar.updateValue(curBytes)
      if (curBytes == fileSize) {
        ws.close()
      }
    }

    ws.onopen = function() {
      /* Send the filename */
      ws.send(file.name)

      /* Start the loop! */
      startReadCurChunk();
    }
  }
}

Uploader.prototype.createButtonRow = function() {
  var buttonRow = document.createElement("div");
  buttonRow.style.marginBottom = "20px";
  this.mainDiv.appendChild(buttonRow);
  return buttonRow;
}

Uploader.prototype.createFileInput = function(buttonRow) {
  var fileDiv = document.createElement("div");
  fileDiv.innerHTML = "<span>Choose File</span>";
  fileDiv.className = "btn btn-primary file-upload";
  var fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  // fileInput.setAttribute("multiple", true);
  fileInput.className = "upload";
  fileDiv.appendChild(fileInput)
  buttonRow.appendChild(fileDiv);
  return fileInput;
}

Uploader.prototype.createSubmitButton = function(buttonRow) {
  var submit = document.createElement("button");
  submit.type="button";
  submit.innerHTML = "Start Upload";
  submit.id = "submit-button";
  submit.className = "btn btn-primary";
  submit.style.display = "none";
  buttonRow.appendChild(submit);
  return submit;
}

Uploader.prototype.createFilenameDisplay = function() {
  var filenameDisplay = document.createElement("p");
  filenameDisplay.style.display = "none";
  this.mainDiv.appendChild(filenameDisplay);
  return filenameDisplay;
}

function ProgressBar(outerDiv, fileSize) {
  this.outerDiv = outerDiv;
  this.fileSize = fileSize;
  this.fileSizeStr = this.numToByteString(this.fileSize);
  var barOuter = document.createElement("div");
  barOuter.className = "progress";
  this.bar = document.createElement("div");
  this.bar.className = "progress-bar";
  this.bar.setAttribute("role", "progressbar");
  this.bar.setAttribute("aria-valuemin", "0");
  this.bar.setAttribute("aria-valuemax", "100");
  barOuter.appendChild(this.bar);
  this.outerDiv.appendChild(barOuter);

  this.text = document.createElement("p");
  this.outerDiv.appendChild(this.text);

  this.message = document.createElement("p");
  this.outerDiv.appendChild(this.message);

  this.updateValue(0);
}

ProgressBar.prototype.numToByteString = function(value) {
  /* Use powers of 1024. */
  var amount;
  var unit;
  if (value < 1024) {
    amount = value;
    unit = "B";
  } else if (value < 1024 * 1024) { 
    amount = value / 1024;
    unit = "kB"
  } else if (value < 1024 * 1024 * 1024) { 
    amount = value / (1024 * 1024);
    unit = "MB";
  } else {
    amount = value / (1024 * 1024 * 1024);
    unit = "GB";
  }
  return amount.toFixed(1) + " " + unit;
}

ProgressBar.prototype.updateValue = function(value) {
  if (value == this.fileSize) {
    this.text.innerHTML = "All " + this.fileSizeStr + " transferred.";
    this.message.innerHTML = "You may safely close this window.";
  } else {
    var valueStr = this.numToByteString(value);
    this.text.innerHTML = valueStr + " of " + this.fileSizeStr + " transferred.";
    this.message.innerHTML = "Please do not close this window until the upload is complete.";
  }

  var percent = Math.floor(value / this.fileSize * 100);
  this.bar.setAttribute("aria-valuenow", percent);
  this.bar.style.width = percent + "%";
  this.bar.innerHTML = percent + "%";

  /* Force browser to redraw progress bar */
  this.bar.style.display = "none";
  this.bar.offsetHeight;
  this.bar.style.display = "block";
}

    /*
    for (var i = 0; i < fileInput.files.length; i++) {
      var file = fileInput.files.item(i);
      console.log(file);
      console.log(readBlob(file.slice(0, 3)));
      console.log(readBlob(file.slice(3, 6)));
    }
    */
