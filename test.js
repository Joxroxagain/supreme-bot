var request = require('request');
var j = request.jar();

var api = {};


api.run = function (url, callback) {
    // var url = 'http://www.google.com';

    request({ url: url, jar: j }, function () {
        console.log(j.getCookies(url));
    })

}

module.exports = api;
