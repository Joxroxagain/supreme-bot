const Bot = require('./bot.js');
const test = require('./test.js');
const Monitor = require("./monitor");
const supreme = require('./api.js');
const Generator = require('./pookygen.js');
const ipcMain = require('electron').ipcMain;

var bots = [];
var monitors = [];

// Called when user adds nbew tasks
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

addBots(5);
startAll();


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


///////TESTING/////////
// (async () => {
//     const cookies = await Generator.getCookies(function (cookies) {
//         console.log(cookies);
//     });
// })();
