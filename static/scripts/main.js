function Uploader(id) {
  this.div = document.getElementById(id);
  var fileUpload = document.createElement("INPUT");
  fileUpload.setAttribute("type", "file");
  fileUpload.setAttribute("multiple", true);
  fileUpload.id = "files-input";
  fileUpload.onchange = function() {
    for (var i = 0; i < fileUpload.files.length; i++) {
      var file = fileUpload.files.item(i);
      console.log(file);
    }
  }
  this.div.appendChild(fileUpload);
  this.fileUpload = fileUpload;
}
