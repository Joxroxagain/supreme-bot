const cheerio = require('cheerio');
var request = require('request-promise');
const querystring = require('querystring');
const events = require('events');
const notifier = require('./notifier.js')
const Generator = require('./pookygen.js');
var tough = require('tough-cookie');


var cookieJar = request.jar();
var request = request.defaults({ jar: true })

var url;
var hasBeenNotified = false;
var item;

module.exports = class Bot {
    constructor(url) {
        this.url = url;
    }

    async start() {

        // Load cookies
        // await Generator.getCookies(function (sessionCookies) {
        //     console.log(sessionCookies)
        //     for (var i = 0; i < sessionCookies.length; i++) {
        //         console.log(sessionCookies[i].name)

        //         // Easy creation of the cookie - see tough-cookie docs for details
        //         // let cookie = new tough.Cookie({
        //         //     key: sessionCookies[i].name,
        //         //     value: sessionCookies[i].value,
        //         //     domain: sessionCookies[i].domain,
        //         //     maxAge: -1
        //         // });

        //         // cookieJar.setCookie(cookie, sessionCookies[i].domain);

        //     }

        // });

        // Wait for drop
        notifier.on('new-items', function (item) {

            if (!hasBeenNotified)

                cartItem((response) => {
                    // console.log(response)
                });

            hasBeenNotified = true;

        });

    };
}

function getItem(itemURL, callback) {

    request(itemURL, function (err, resp, html, rrr, body) {

        if (err) {
            return callback('No response from website', null);
        } else {
            var $ = cheerio.load(html);
        }

        var sizeOptionsAvailable = [];
        if ($('option')) {
            $('option').each(function (i, elem) {
                var size = {
                    id: parseInt($(this).attr('value')),
                    size: $(this).text(),
                }
                sizeOptionsAvailable.push(size);
            });

            if (sizeOptionsAvailable.length > 0) {
                sizesAvailable = sizeOptionsAvailable
            } else {
                sizesAvailable = null
            }
        } else {
            sizesAvailable = null;
        }

        var availability;
        var addCartURL = api.url + $('form[id="cart-addf"]').attr('action');

        var addCartButton = $('input[value="add to cart"]')
        if (addCartButton.attr('type') == '') {
            availability = 'Available'
        } else {
            availability = 'Sold Out'
        }

        if (availability == 'Sold Out') {
            addCartURL = null
        }

        var metadata = {
            title: $('h1').attr('itemprop', 'name').eq(1).html(),
            style: $('.style').attr('itemprop', 'model').text(),
            link: itemURL,
            description: $('.description').text(),
            addCartURL: addCartURL,
            price: parseInt(($('.price')[0].children[0].children[0].data).replace('$', '').replace(',', '')),
            image: 'http:' + $('#img-main').attr('src'),
            sizesAvailable: sizesAvailable,
            images: [],
            availability: availability
        };

        // Some items don't have extra images (like some of the skateboards)
        if ($('.styles').length > 0) {
            var styles = $('.styles')[0].children;
            for (li in styles) {
                for (a in styles[li].children) {
                    if (styles[li].children[a].attribs['data-style-name'] == metadata.style) {
                        metadata.images.push('https:' + JSON.parse(styles[li].children[a].attribs['data-images']).zoomed_url)
                    }
                }
            }
        } else if (title.indexOf('Skateboard') != -1) {
            metadata.images.push('https:' + $('#img-main').attr('src'))
        }

        callback(null, metadata);
    });
};

function cartItem(callback) {

    var body = {
        "s": "63029",
        "st": "22422",
        "qty": "1"
    };

    var formData = querystring.stringify(body);
    var contentLength = formData.length;

    // Set the headers for the request
    var headers = {
        "Accept": "application/json",
        "Origin": "https://www.supremenewyork.com",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        'Content-Length': contentLength,
        "Referer": "https://www.supremenewyork.com/mobile/",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        "Cookie": "",
    };

    // Configure the request
    var options = {
        url: "https://www.supremenewyork.com/shop/171995/add.json",
        method: 'POST',
        headers: headers,
        body: formData,
        jar: cookieJar
    };

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Print out the response body
            console.log(response.statusCode);
            console.log(response.headers['set-cookie']);
            const cookies = response.headers['set-cookie'] || [];
            // cookies.forEach(c => {
            //     cookieJar.setCookie(c, url);
            // });
            // console.log(cookieJar.getCookies(url));
            callback(response);
        } else {
            console.log(error);
        }
    });

};

function loadItem(callback) {

    request({ url: cartURL, jar: cookieJar }, function (err, resp, html, rrr, body) {
        callback();
    });

};

function checkoutItem(callback) {

    var body = {
        "credit_card[cnb]": "4532 9072 8270 0827",
        "credit_card[month]": "01",
        "credit_card[rsusr]": "333",
        "credit_card[year]": "2025",
        "from_mobile": "1",
        "g-recaptcha-response": "",
        "order[billing_address]": "3820 Cedar Run Ct.",
        "order[billing_address_2]": "",
        "order[billing_city]": "Efland",
        "order[billing_country]": "USA",
        "order[billing_name]": "Joe Scott",
        "order[billing_state]": "NC",
        "order[billing_zip]": "27243",
        "order[email]": "jox.rox.js@gmail.com",
        "order[tel]": "919-928-1202",
        "order[terms]": [
            "0",
            "1"
        ],
        "same_as_billing_address": "1",
        "store_credit_id": ""
    };

    var formData = querystring.stringify(body);
    var contentLength = formData.length;

    // Set the headers for the request
    var headers = {
        "Accept": "application/json",
        "Origin": "https://www.supremenewyork.com",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        'Content-Length': contentLength,
        "Referer": "https://www.supremenewyork.com/mobile/",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
        "Cookie": "",
    };

    // Configure the request
    var options = {
        url: "https://www.supremenewyork.com/checkout.json",
        method: 'POST',
        headers: headers,
        body: formData
    };

    // Start the request
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // Print out the response body
            // console.log(response.statusCode);
            // console.log(response.headers['set-cookie']);
            callback(response);
        } else {
            console.log(error);
        }
    });

};
