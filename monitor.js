var cheerio = require('cheerio');
var request = require('request');
var querystring = require('querystring');
const supreme = require('./api.js');
var notifier = require('./notifier.js')

var watchOnAllItems = [];
var refreshInterval;
var previousReturn;


module.exports = class Monitor {

    constructor(interval) {
        this.refreshInterval = interval;
    }

    start() {

        console.log('Now watching for items');
        watchOnAllItems = setInterval(function () {
            supreme.getNewItems(function (thisReturn) {
                if (previousReturn == null) {
                    previousReturn = thisReturn;
                } else {
                    if(JSON.stringify(previousReturn) == JSON.stringify(thisReturn))
                        console.log("SAME THING!")
                }


            });
        }, 1000 * this.refreshInterval); // Every xx sec

    }

    stop() {
        clearInterval(watchOnAllItems);
        if (watchOnAllItems == "") {
            callback(null, 'No watching processes found.');
        } else {
            callback('Watching has stopped.', null);
        }

    }

}

