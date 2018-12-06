const puppeteer = require('puppeteer');
var Queue = require('better-queue');

const url = "https://www.supremenewyork.com/news";
var isStarted = false;
var browser;

class Generator {

    constructor() {

    }

    static async getCookies(cb) {

        // Push a new job onto the queue 
        // q.push(await getCookie(function (sessionCookies) {
        //     cb(sessionCookies);
        // }));
        console.log("Pushing")
        this.Q.push(1, cb)
            .on('finish', function (result) {
                // Task succeeded with {result}!
            })
            .on('failed', function (err) {
                // Task failed!
            })

        // console.log(this.Q.getStats());
    }

}

Generator.Q = new Queue(async function (input, cb) {

    // Start browser if not already running
    if (browser == null) await startBrowser();

    const context = await browser.createIncognitoBrowserContext();

    const page = await context.newPage();

    // Prepare for the tests (not yet implemented).
    await prepareForTests(page);

    // Navigate to the page that will perform the tests.
    await page.goto(url, { waitUntil: 'load' });

    await page.click('.shop_link');

    // Loop until pooky_pro cookie is found
    var found = false;
    while (!found) {
        await page.waitFor(1000)

        var sessionCookies = await page.cookies();

        for (var i = 0; i < sessionCookies.length; i++) {
            if (sessionCookies[i].name == 'pooky_pro') {
                found = true;
                break;
            }
        }
    }

    await page.close();

    cb(sessionCookies, 'finish');

}, { concurrent: 1 });

Generator.Q.on('drain', async function () {
    // Stop the browser
    await browser.close();
    isStarted = false;

})



// Hide elements that give away the browser as automation
// Also disable loading of images and other unnecessary files
const prepareForTests = async (page) => {

    // Pass the User-Agent Test.
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36";
    // const userAgent = new UserAgent().toString();
    // console.log(userAgent);

    // const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    //     'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);

    const blockedResourceTypes = [
        'image',
        'media',
        'font',
        'texttrack',
        'object',
        'beacon',
        'csp_report',
        'imageset',
    ];

    const skippedResources = [
        'quantserve',
        'adzerk',
        'doubleclick',
        'adition',
        'exelator',
        'sharethrough',
        'cdn.api.twitter',
        'google-analytics',
        'googletagmanager',
        'google',
        'fontawesome',
        'facebook',
        'analytics',
        'optimizely',
        'clicktale',
        'mixpanel',
        'zedo',
        'clicksor',
        'tiqcdn',
    ];

    await page.setRequestInterception(true);

    page.on('request', request => {
        const requestUrl = request._url.split('?')[0].split('#')[0];
        if (requestUrl.endsWith("/_bm/_data")) {
            console.log("FOUND /_bm/_data")
            // console.log(request)
            request.continue();
        } else
            if (
                blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
                skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
            ) {
                request.abort();
            } else {
                request.continue();
            }
    });

    page.on('response', async response => {
        if (response.url().endsWith("availability?sitePath=us")) {
            // var sizes = await response.json();
            // console.log(sizes);
            // getBestSize(sizes);
        }
    });

    page.on('response', async response => {
        if (response.url().endsWith("api/cart_items?sitePath=us")) {
            console.log("response code: ", response.status());
        }
    });

    // Pass the Webdriver Test.
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    // Pass the Chrome Test.
    await page.evaluateOnNewDocument(() => {
        // We can mock this in as much depth as we need for the test.
        window.navigator.chrome = {
            runtime: {},
            // etc.
        };
    });

    // Pass the Permissions Test.
    await page.evaluateOnNewDocument(() => {
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );
    });

    // Pass the Plugins Length Test.
    await page.evaluateOnNewDocument(() => {
        // Overwrite the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'plugins', {
            // This just needs to have `length > 0` for the current test,
            // but we could mock the plugins too if necessary.
            get: () => [1, 2, 3, 4, 5],
        });
    });

    // Pass the Languages Test.
    await page.evaluateOnNewDocument(() => {
        // Overwrite the `plugins` property to use a custom getter.
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
    });

    await page.evaluateOnNewDocument(() => {
        const captchaInterval = setInterval(() => {
            const challengeFrame = document.querySelector('iframe[role="presentation"]');

            if (challengeFrame) {
                const challengeButton = challengeFrame.contentDocument.getElementsByClassName('recaptcha-checkbox-checkmark')[0];

                if (challengeButton) {
                    challengeButton.click();
                }
            }
        }, 500);
    });

}

async function startBrowser() {

    // Launch the browser in headless mode and set up a page.
    browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
        ],
        headless: false,
    });

    isStarted = true;

}

module.exports = Generator;
