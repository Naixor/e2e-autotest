var casper = require('casper').create();
casper.options.viewportSize = {width: 375, height: 627};

casper.test.begin('160_1:1017,3028 page', 5, function (test) {
    casper.start('https://www.baidu.com');
    
    casper.userAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4');
    
    casper.waitForSelector('#ec_wise_adtopnum', function () {
        test.assertSelectorHasText('#ec_wise_adtopnum > a > h3', '鲜花中国鲜花网,全国第一大鲜花网站鲜花');
    });
    select('#ec_price', 1).
    then(function () {
        test.assertEvalEquals(function () {
            return document.querySelector('#ec_price').value;
        }, '5-10万元');
    });
    select('#ec_timespan', 1).
    then(function() {
        test.assertEvalEquals(function () {
            return document.querySelector('#ec_timespan').value;
        }, '6个月');
    });
    casper.then(function () {
        return this.click('button.c-btn.c-btn-primary.ec_fwy_btn.ec_fwy_valid_check_btn');
    }).
    then(function () {
        test.assertEvalEquals(function () {
            return document.querySelector('div.ec_home_p2p_error_check.c-gap-top-large.c-gap-bottom-large').style.display;
        }, 'block');
    });
    casper.then(function() {
        return this.sendKeys('input.c-input.ec_fwy_valid_data.ec_fwy_input_limit.ec_fwy_p2p_tel.ec_fwy_input_type_number', '13718485711'); 
    }).
    then(function () {
        return this.click('button.c-btn.c-btn-primary.ec_fwy_btn.ec_fwy_valid_check_btn');
    }).
    then(function () {
        test.assertEvalEquals(function () {
            return document.querySelector('div.c-gap-top-large.c-gap-bottom-small.ec_home_p2p_success').style.display;
        }, 'block');
    });
    
    casper.run(function () {
        test.done();
    });
});

function select(selectId, clickIdx) {
    casper.thenClick(selectId);
    return casper.thenClick(selectId +' > option:nth-child('+ clickIdx +')');
}