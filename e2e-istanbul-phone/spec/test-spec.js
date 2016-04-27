var fs = require('fs');
var webdriver = require('selenium-webdriver');
var proxy = require('selenium-webdriver/proxy');
var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    setProxy(proxy.manual({http: 'localhost:3334', https: 'localhost:3334'})).
    build();

var chai = require('chai');
var chaiWebdriver = require('chai-webdriver');
chai.use(chaiWebdriver(driver));

var expect = chai.expect;

var url = 'http://yf-model-stream-tm-a00024.yf01.baidu.com:8003/s?tn=iphone&sid=100614&word=160_1:1017,3028';

describe('160_1:1017,3028 page', function() {
    this.timeout(60 * 1000);
    before((done) => {
        driver.manage().window().setSize(375, 627);
        start(url, done);
    });

    it('#ec_wise_adtopnum存在, 且标题为《鲜花中国鲜花网,全国第一大鲜花网站鲜花》', (done) => {
        driver.wait(webdriver.until.elementLocated(webdriver.By.id('ec_wise_adtopnum')), 2000).
        then(() => {
            expect('#ec_wise_adtopnum > a > h3').dom.to.contain.text('鲜花中国鲜花网,全国第一大鲜花网站鲜花');
            done();
        });
    });
    it('选择起投金额第二项', (done) => {
        select('ec_price', 2, '5-10万元', done);
    });
    
    it('选择投资金额第二项', (done) => {
        select('ec_timespan', 2, '6个月', done);    
    });
    
    it('直接提交会提示错误: *请确认输入信息无误', (done) => {
        driver.findElement(webdriver.By.css('button.c-btn.c-btn-primary.ec_fwy_btn.ec_fwy_valid_check_btn')).click().
        then(function () {
            return expect('div.ec_home_p2p_error_check.c-gap-top-large.c-gap-bottom-large').dom.to.have.style('display', 'block');
        }).
        then(function () {
            return expect('div.ec_home_p2p_error_check.c-gap-top-large.c-gap-bottom-large').dom.to.have.text('*请确认输入信息无误');
        }).
        then(done);
    });
    
    it('输入13718485711;提交', (done) => {
        driver.findElement(webdriver.By.css('input.c-input.ec_fwy_valid_data.ec_fwy_input_limit.ec_fwy_p2p_tel.ec_fwy_input_type_number')).
        sendKeys('13718485711').
        then(() => {
            return driver.findElement(webdriver.By.css('button.c-btn.c-btn-primary.ec_fwy_btn.ec_fwy_valid_check_btn')).click();
        }).
        then(() => {
            return expect('div.c-gap-top-large.c-gap-bottom-small.ec_home_p2p_success').dom.to.have.style('display', 'block');
        }).
        then(() => {
            done();
        });
    });
    
    after((done) => {
        end(done);
    });
});

function start(url, callback) {
    driver.get(url).then(callback);
}

function end(callback) {
    driver.switchTo().defaultContent();
    driver.executeScript("return window.__coverage__;").then((obj) => {
        fs.writeFile('coverage/coverage.json', JSON.stringify(obj));
        driver.quit().then(callback);
    }, (err) => {
        console.log(err);
        driver.quit().then(callback);
    });
}

function select(selectId, clickIdx, expectVal, done) {
    var ele = driver.findElement(webdriver.By.id(selectId));

    ele.click().
    then(() => {
        return driver.findElement(webdriver.By.css(`#${selectId} > option:nth-child(${clickIdx})`)).click();
    }).
    then(() => {
        return driver.executeScript(`return document.querySelector("#${selectId}").value;`);
    }).
    then((val) => {
        return expect(val).to.equal(expectVal);
    }).
    then(() => {
        done();
    });
}