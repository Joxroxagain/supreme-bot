var noUiSlider = require("nouislider");
var ipcRenderer = require("electron").ipcRenderer;

document.getElementById("launch").addEventListener("click", function () {
  ipcRenderer.send('start-bot');
});


var pipsSlider = document.getElementById('slider-pips');

noUiSlider.create(pipsSlider, {
  range: {
    // Starting at 500, step the value by 500,
    // until 4000 is reached. From there, step by 1000.
    'min': [4],
    'max': [17]
  },
  connect: true,
  step: .5,
  start: [4, 19],
  pips: {
    mode: 'count',
    values: 14,
    density: 4,
    stepped: true
  }
});

var pips = pipsSlider.querySelectorAll('.noUi-value');

function clickOnPip() {
  var value = Number(this.getAttribute('data-value'));
  pipsSlider.noUiSlider.set(value);
}

for (var i = 0; i < pips.length; i++) {
  pips[i].style.cursor = 'pointer';
  pips[i].addEventListener('click', clickOnPip);
}