var cheerio = require('cheerio');
var querystring = require('querystring');
const fetch = require('node-fetch');

var api = {};

api.url = 'http://www.supremenewyork.com';
api.mobileEndpoint = api.url + '/mobile_stock.json';

String.prototype.capitalizeEachWord = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// getItem('all')
// other options: new, jackets, shirts, tops_sweaters, sweatshirts,
// pants, hats, bags, accessories, shoes, skate

/**
 * Checks for items under desired category
 *
 * @param  {String} category
 * @return {Array}
 */

api.getNewItems = async function () {
    try {
        const resp = await fetch(api.mobileEndpoint, {
            credentials: "include",
            headers: {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9,fr;q=0.8",
                "content-type": "application/x-www-form-urlencoded",
                "x-requested-with": "XMLHttpRequest"
            },
            referrer: "https://www.supremenewyork.com/mobile/",
            referrerPolicy: "no-referrer-when-downgrade",
            method: "POST",
            mode: "cors"
        })
        return (JSON.parse(await resp.text())).products_and_categories.new;
    } catch (err) {
        return null;
    }
};

// Not working
api.getLargestItemID = async () => {

    return new Promise(function (resolve, reject) {

        request(api.mobileEndpoint, async (err, resp, html, rrr, body) => {
            let largestProductID = 0;
            const json = JSON.parse(resp.body);
            if (!err) {
                const products_and_categories = json['products_and_categories'];
                largestProductID = products_and_categories['new'].map(p => p.id).reduce((a, b) => Math.max(a, b))
                var largestSizeID = await api.getLargestSizeID(largestProductID);
                console.log(largestProductID)
                console.log(largestSizeID)
                resolve(largestSizeID);
            } else {
                console.log(err);
                reject(error);
            }
        })

    });

};

// Not working
api.fetchVariants = async (largestSize, amount) => {

    // let items = {};
    // for(let i = largestSize + 1; i < largestSize + amount; i++) {
    //     items[i] = 1;
    // } 
    // const size = parseInt(largestSize) + 1;
    const cooksub = encodeURIComponent(JSON.stringify(`${largestSize}:1`).replace(/'/g, '"'));

    const usCheckoutData = {
        "cookie-sub": "%7B%2262823%22%3A1%7D",
        "credit_card[cnb]": "4024 0071 4962 0261",
        "credit_card[month]": "01",
        "credit_card[rsusr]": "333",
        "credit_card[year]": "2023",
        "from_mobile": "1",
        "g-recaptcha-response": "",
        "order[billing_address]": "",
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

    var formData = querystring.stringify(usCheckoutData);
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
        url: api.mobileEndpoint,
        method: 'POST',
        headers: headers,
        body: formData
    };

    // Start the request
    await request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            const data = JSON.parse(response.body);

            console.log(data);

            let variants = [];
            if (data.status == 'outOfStock') {
                for (let variant in data.mp) {
                    variants.push({
                        'Product Name': data.mp[variant]['Product Name'],
                        'Product Color': data.mp[variant]['Product Color'],
                        'Product Size': data.mp[variant]['Product Size'],
                        'Product ID': parseInt(largestSizeID) + parseInt(variant)
                    })
                }
            }
            return variants;
        } else {
            console.log(error);
            return [];
        }
    });

}

// Not working
api.getLargestSizeID = async (largestItemID) => {

    var getURL = `https://supremenewyork.com/shop/${largestItemID}.json`;
    return new Promise(function (resolve, reject) {
        request(getURL, function (err, resp, html, rrr, body) {
            const json = JSON.parse(resp.body);
            const lastProduct = json.styles[json.styles.length - 1]
            const lastProductID = lastProduct.sizes[lastProduct.sizes.length - 1].id;
            return resolve(lastProductID);
        });
    });

};

api.getItem = function (itemURL, callback) {

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
        if (addCartButton.attr('type') == 'submit') {
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

api.watchOnAllItems = [];
api.watchAllItems = function (interval, category, callback) {
    api.log('Now watching for items');
    api.watchOnAllItems = setInterval(function () {
        api.getItems(category, function (items) {
            callback(items, null);
        });
    }, 1000 * interval); // Every xx sec
}

api.stopWatchingAllItems = function (callback) {
    clearInterval(api.watchOnAllItems);
    if (api.watchOnAllItems == "") {
        callback(null, 'No watching processes found.');
    } else {
        callback('Watching has stopped.', null);
    }
}

// searches for new item drop TODO
api.onNewItem = function (callback) {
    api.watchAllItems(1, 'new', function (item) {
        callback(item, null);
    });
}

/**
 * Seeks for items on desired category page with specific keywords/styles.
 * @param  {Number} interval
 * @param  {String} category
 * @param  {String} style
 * @param  {String} category
 * @return {Object}
 */
api.seek = function (category, keywords, styleSelection, callback) {
    var productLink = [];
    api.getItems(category, (product, err) => {

        if (err) {
            return callback(null, 'Error occured while trying to seek for items.');
        }

        for (i = 0; i < product.length; i++) {
            var title = product[i].title;
            var style = product[i].style;

            if (style === null) {
                // type - style not defined without a match
                if (title.indexOf(keywords) > -1) { // check if the keywords match with the title
                    // found item
                    productLink.push(product[i].link);
                    return callback(product[i], null);
                    break;
                } else {
                    continue;
                }
            } else if (style.indexOf(styleSelection) > -1) {
                // type - style defined with match
                if (title.indexOf(keywords) > -1) { // check if the keywords match with the title
                    // found item
                    productLink.push(product[i].link);
                    return callback(product[i], null);
                    break;
                } else {
                    continue;
                }
            }
        }

        if (productLink[0] === undefined) {
            return callback(null, "Could not find any results matching your keywords.");
        }

    });
}

api.log = function (message) {
    console.log('[supreme api] ' + message);
}

module.exports = api;
