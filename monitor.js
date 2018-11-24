var cheerio = require('cheerio');
var request = require('request');
var querystring = require('querystring');
const api = require('./api.js');
var notifier = require('./notifier.js')

var watchOnAllItems = [];
var refreshInterval;
var previousReturn;


module.exports = class Monitor {

    constructor(interval) {
        this.refreshInterval = interval;
    }

    start() {
        console.log("started watching for items!")

        watchOnAllItems = setInterval(function () {
            api.getNewItems(function (thisReturn) {
                if (previousReturn == null) {
                    previousReturn = thisReturn;
                } else {
                    if(JSON.stringify(previousReturn) == JSON.stringify(thisReturn)) {
                        console.log("SAME THING!")
                    } else {
                        console.log("NEW ITEMS! OMG")
                    }
                }
            });
        }, 1000 * this.refreshInterval); // Every xx sec

    }

    stop(callback) {
        clearInterval(watchOnAllItems);
        if (watchOnAllItems == "") {
            callback(null, 'No watching processes found.');
        } else {
            callback('Watching has stopped.', null);
        }

    }

}

