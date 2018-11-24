var cheerio = require('cheerio');
var request = require('request');
var querystring = require('querystring');
const supreme = require('./api.js');
var notifier = require('./notifier.js')

module.exports = class Monitor {
    constructor() {
    }

    getEmitter() {
        return eventEmitter;
    }

    start() {

        // check every 5 seconds
        supreme.watchAllItems(5, 'new', (items, err) => {
            if (err) {
                console.log(err);
                return err;
            } else {
                notifier.emit('items-found', items)
            }
        });
    }

}
