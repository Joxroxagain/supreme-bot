var cheerio = require('cheerio');
var request = require('request');
var querystring = require('querystring');
const api = require('./api.js');
var notifier = require('./notifier.js')

var running = [];
var refreshInterval;
var previousReturn;


module.exports = class Monitor {

    constructor(options) {
        this.refreshInterval = options.interval;
    }

    start() {

        // Stop monitoring once new items are found
        notifier.on('new-items', () => {
            this.stopMonitoring();
        });

        running = setInterval(function () {
            api.getNewItems(function (str) {
                var thisReturn = JSON.stringify(str);

                if (previousReturn == thisReturn){
                    //Emit the new JSON once it is availible
                    notifier.emit('new-items', thisReturn);
                }

                previousReturn = thisReturn;

            });
        }, 1000 * this.refreshInterval); // Every xx sec

    }

    stopMonitoring(callback) {
        clearInterval(running);
        // if (running == "") {
        //     callback(null, 'No watching processes found.');
        // } else {
        //     callback('Watching has stopped.', null);
        // }

    }

}

