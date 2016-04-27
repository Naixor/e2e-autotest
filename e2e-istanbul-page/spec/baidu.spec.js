var fs = require('fs');
var webdriver = require('selenium-webdriver');
var proxy = require('selenium-webdriver/proxy');
var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    // setProxy(proxy.manual({http: 'localhost:3333', https: 'localhost:3333'})).
    build();

var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');
chai.use(chaiWebdriver(driver));

var expect = chai.expect;

var url = 'https://www.baidu.com';

describe('Main page', function () {
    this.timeout(60 * 1000);
    before(function (done) {
        start(url, done);
    });
    
    it('should have title of 百度一下，你就知道', function (done) {
        driver.getTitle().then(function(title) {
            expect(title).to.equal('百度一下，你就知道');
        }).then(done);
    });
    it('#u1 > a:nth-child(8)设置', function (done) {
        var ele1 = driver.findElement(webdriver.By.css('#u1 > a:nth-child(8)'));
        // var ele2 = driver.findElement(webdriver.By.css('#wrapper > div.bdpfmenu > a:nth-child(2)'));
        new webdriver.ActionSequence(driver)
            .mouseMove(ele1)
            // .mouseMove(ele2)
            .perform();
        driver.wait(webdriver.until.elementLocated(webdriver.By.css('#wrapper > div.bdpfmenu > a:nth-child(2)')), 2000).click();
        driver.wait(webdriver.until.elementLocated(webdriver.By.css('div.bdlayer.pfpanel')), 2000)
        .then(function () {
            expect('div.bdlayer.pfpanel').dom.to.be.visible();
        })
        .then(done);
    });
    it('should show 图片_百度图片 when search tupian', function (done) {
        // driver.findElement(webdriver.By.id('kw')).sendKeys('tupian')
        // .then(function () {
        //     return driver.findElement(webdriver.By.id('su')).click();
        // })
        // .then(function () {
        //     return driver.wait(webdriver.until.elementLocated(webdriver.By.id('1')), 2000);
        // })
        // .then(function () {
        //     return expect('#1 > h3 > a').dom.to.contain.text('图片_百度图片');
        // }).then(done);
        driver.manage().window().setSize(1200, 1000);
        driver.findElement(webdriver.By.css('span.pfpanelclose.close.briiconsbg')).click();
        driver.findElement(webdriver.By.id('kw')).sendKeys(webdriver.Key.chord(webdriver.Key.COMMAND, webdriver.Key.SPACE), 'tupian');
        driver.findElement(webdriver.By.id('su')).click();
        driver.wait(webdriver.until.elementLocated(webdriver.By.id('1')), 2000)
        .then(function () {
            expect('#1 > h3 > a').dom.to.contain.text('图片_百度图片');
        }).then(done);
    });
    
    after(function (done) {
        end(done);
    });
});

function start(url, callback) {
    driver.get(url).then(callback);
}

function end(callback) {
    driver.switchTo().defaultContent();
    driver.executeScript("return window.__coverage__;").then(function (obj) {
        fs.writeFile('coverage/coverage.json', JSON.stringify(obj));
        return driver.quit();
    }, function fail(err) {
        console.log(err);
        driver.quit().then(callback);
    }).then(callback);
}