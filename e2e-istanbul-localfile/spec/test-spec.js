var fs = require('fs');
var webdriver = require('selenium-webdriver');
var proxy = require('selenium-webdriver/proxy');
var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');
chai.use(chaiWebdriver(driver));

var expect = chai.expect;

var url = 'http://localhost:3000/prod';

describe('Main page', function () {
    this.timeout(60 * 1000);
    before(function (done) {
        start(url, done);
    });
    
    it('should have title of Test Title', function (done) {
        driver.getTitle().then(function(title) {
            expect(title).to.equal('Test Title');
            done();
        });
    });
    it('should show extra div when clicking on link', function (done) {
        driver.findElement(webdriver.By.id('clicker')).click();
        expect('#jQueryAddedDiv').dom.to.contain.text('added through jquery');
        done();
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
        callback();
        // driver.quit().then(callback);
    }, function fail(err) {
        console.log(err);
        driver.quit().then(callback);
    });
}