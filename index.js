const Bot = require('./bot.js');
const test = require('./test.js');
const Monitor = require("./monitor");
const supreme = require('./api.js');

var bots = [];
var monitors = [];

// // Called when user adds nbew tasks
function addBots(number) {
  for (let i = 0; i < number; i++) {
    bots.push(new Bot("171997"));
  }
}

function addMonitors(number) {
  for (let i = 0; i < number; i++) {
    monitors.push(new Monitor(10));
  }
}

function startAll() {
  for (let i = 0; i < bots.length; i++) {
    bots[i].start();
  }
  for (let i = 0; i < monitors.length; i++) {
    monitors[i].start();
  }
}

addMonitors(1);
// addBots(5);
startAll();


///////TESTING/////////


