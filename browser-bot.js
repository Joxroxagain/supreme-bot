const pluginStealth = require("puppeteer-extra-plugin-stealth");
var cheerio = require('cheerio');
var UserAgent = require('user-agents');

var notifier = require('./notifier.js')

const puppeteer = require('puppeteer-extra')
puppeteer.use(pluginStealth());

var addressCookie = [
    {
        name: "js-address",
        value: 'Joe%20Scott|jox.rox.js%40gmail.com|919-928-1202|3820%20Cedar%20Run%20Ct.||Efland|NC|27243|USA',
        domain: 'www.supremenewyork.com'
    }
];

class Bot {

    constructor(options) {
        this.page = null;
        this.browser = null;
        this.keyword = options.keyword;
    }

    async prepare() {

        // Create mobile user agent
        const userAgent = new UserAgent({ deviceCategory: 'mobile' })

        // Start browser if not already running
        if (this.browser == null)
            this.browser = await puppeteer.launch({ headless: false });
        // Create main page
        this.page = (await this.browser.pages())[0];

        // Set viewport size (may not be needed)
        // await this.page.setViewport({ width: userAgent.data.viewportWidth, height: userAgent.data.viewportHeight })

        // Set user agent
        await this.page.setUserAgent(userAgent.toString());

        await this.page.setViewport({ width: 0, height: 0 });

        await this.page.setCookie(...addressCookie);

        notifier.once('new-items', (items) => {
            var bogos = items.filter(d => d.name.includes(this.keyword))
            this.checkout(`https://www.supremenewyork.com/mobile/#products/${bogos[0].id}`)
            return;
        });

        // Navigate to the page
        await this.page.goto("https://www.supremenewyork.com/shop/new", { waitUntil: 'domcontentloaded' });

    }

    async checkout(url) {

        await this.page.goto(url, { waitUntil: 'domcontentloaded' });

        const dropdown = await this.page.waitForSelector('#size-options', { visible: true })

        var $ = cheerio.load(await this.page.evaluate(() => document.body.innerHTML));

        var sizeOptionsAvailable = [];
        if ($('#size-options')) {
            $('option').each(function (i, elem) {
                var size = {
                    id: parseInt($(this).attr('value')),
                    size: $(this).text(),
                }
                sizeOptionsAvailable.push(size);
            });
        } else {
            sizeOptionsAvailable = null;
        }

        if (sizeOptionsAvailable.length != 0) {

            const sizeToBuy = sizeOptionsAvailable[sizeOptionsAvailable.length - 1]

            const selectElem = await this.page.$('#size-options');
            await selectElem.type(sizeToBuy.size);

        } else {
            console.log(`No sizes found!`)
            return;
        }

        
        await this.page.waitForSelector('#cart-update', { visible: true })
        await this.page.focus('span[class="cart-button"]');
        await this.page.click('span[class="cart-button"]');

        // Click the submit button
        const checkout = await this.page.waitForSelector('#checkout-now', { visible: true })
        await checkout.focus();

        // Click checkout button
        await Promise.all([
            this.page.click("#checkout-now"),
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded' })
        ]);

        const input = await this.page.waitForSelector('#credit_card_n', { visible: true })

        await input.click({ clickCount: 1 })
        await input.type('4616081118283165');
    
        await this.page.select('#credit_card_month', '01')
        await this.page.select('#credit_card_year', '2022')
    
        const input2 = await this.page.waitForSelector('#cav', { visible: true })
    
        await input2.click({ clickCount: 1 })
        await input2.type('333');
    
        const input3 = await this.page.waitForSelector('#order_terms', { visible: true })
        await input3.click({ clickCount: 1 })
    
        const input4 = await this.page.waitForSelector('#submit_button', { visible: true })
        await input4.click({ clickCount: 1 })
    
        await this.page.evaluate(async () => { recaptchaCallback() })

    }

}

module.exports = Bot;
