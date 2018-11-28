var ipcRenderer = require("electron").ipcRenderer;

document.getElementById("launch").addEventListener("click", function () {
  ipcRenderer.send('start-bot');
});