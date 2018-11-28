var noUiSlider = require("nouislider");

var pipsSlider = document.getElementById('slider-pips');
var pipFormats = { '0': 'small', '1': 'medium', '2': 'large', '3': 'x-large' };

noUiSlider.create(pipsSlider, {
  start: [0, 4],
  connect: true,
  range: {
    'min': [0, 1],
    '33%': [1, 1],
    '66%': [2, 1],
    'max': [3, 1]
  },
  pips: {
    mode: 'range',
    values: 4,
    density: 100,
    stepped: true,
    format: {
      to: function (a) {
        return pipFormats[a];
      }
    }
  }
  // Adidas bot size selector options
  // range: {
  //   'min': [4],
  //   'max': [17]
  // },
  // connect: true,
  // step: .5,
  // start: [4, 19],
  // pips: {
  //   mode: 'count',
  //   values: 14,
  //   density: 4,
  //   stepped: true
  // }
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