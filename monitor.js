var cheerio = require('cheerio');
var request = require('request');
var querystring = require('querystring');
const api = require('./api.js');
var notifier = require('./notifier.js')

var previousReturn

module.exports = class Monitor {

    constructor(options) {
        this.refreshInterval = options.interval;
        this.proxy = options.proxy;
        this.interval = null;
        this.releaseDate = options.date;
    }

    start() {

        // Stop monitoring once new items are found
        notifier.once('new-items', (items) => {
            this.stop();
        });

        this.interval = setInterval(getStock, 1000 * this.refreshInterval)

        const int = setInterval(() => {
            if ((Date.now() - this.releaseDate) >= 0) {
                console.log('Release time reached! Checking mobile stock more often now...')
                this.stop();
                clearInterval(int)
                this.interval = setInterval(getStock, 500)
            }
        }, 10)

    }

    stop() {
        clearInterval(this.interval)
    }

}

async function getStock() {
    const resp = await api.getNewItems();

    if (resp == null) {
        console.log(`Error parsing json from ${api.mobileEndpoint}: result was null!`)
    } else {
        var thisReturn = JSON.stringify(resp);
        if (previousReturn != thisReturn && typeof previousReturn != 'undefined') {
            //Emit the new JSON once it is availible
            notifier.emit('new-items', resp);
        }
        previousReturn = thisReturn;
    }

}
