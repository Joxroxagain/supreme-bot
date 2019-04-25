const RequestBot = require('./request-bot.js');
const BrowserBot = require('./browser-bot.js');
const Monitor = require("./monitor");

var bots = [];
var monitors = [];

const releaseDate = new Date("");

// Called when user adds nbew tasks
function addBots(number) {
  for (let i = 0; i < number; i++) {
    bots.push(new BrowserBot({ keyword: 'contrast' }));
  }
}

function addMonitors(number) {
  for (let i = 0; i < number; i++) {
    monitors.push(new Monitor({ interval: 2, date: releaseDate }));
  }
}

function startAll() {

  monitors.forEach(element => { element.start() });
  bots.forEach(element => { element.prepare() });

}

addMonitors(1);
addBots(1);
startAll();


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


///////TESTING/////////
// (async () => {
//   var Queue = require('better-queue');

//   var q = new Queue(function (input, cb) {

//     console.log(input)

//     cb(null, result);
//   }, { concurrent: 1 })

//   q.push(1)
//   q.push({ x: 1 })
//   q.push(1)
//   q.push({ x: 1 }) 
//   q.push({ x: 1 })  
//   q.push({ x: 1 }) 
//   q.push({ x: 1 })
// })();
