// this file is a slight modification of the phantomjs run-jasmine2.js example at:
// https://raw.githubusercontent.com/ariya/phantomjs/master/examples/run-jasmine2.js

"use strict";
var system = require('system');

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param options object with custom behaviour attributes
 */
function waitFor(testFx, onReady, options) {
    if(!options) options = {};
    if(!options.timeOutMillis) options.timeOutMillis = 3001; //< Default Max Timeout is 3s

    var start = new Date().getTime(),
        condition = false;

    var interval = setInterval(function() {
        if ( (new Date().getTime() - start < options.timeOutMillis) && !condition ) {
            // If not time-out yet and condition not yet fulfilled
            condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
        } else {
            if(!condition) {
                if(options.onTimeOut){
                    typeof(options.onTimeOut) === "string" ? eval(options.onTimeOut) : options.onTimeOut();
                } else {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                }

                phantom.exit(1);
            } else {
                // Condition fulfilled (timeout and/or condition is 'true')
                console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                clearInterval(interval); //< Stop this interval
            }
        }
    }, 100); //< repeat check every 100ms
};

if (system.args.length < 2) {
    console.log('Usage: runPhantomJsJasmineTests.js URL [timeout=8001]');
    phantom.exit(1);
}

var jasmineTimeout = system.args.length >= 3 ? system.args[2] : 8001;
var page = require('webpage').create();


// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

console.log("Loading '"+system.args[1]+"'...")
page.open(system.args[1], function(status){
    if (status !== "success") {
        console.log("Unable to access network");
        phantom.exit();
        return;
    }

    console.log("Injecting Jasmine core code...");
    page.injectJs('js/jasmine-2.5.2/jasmine.js')
    page.injectJs('js/jasmine-2.5.2/jasmine-html.js')
    page.injectJs('js/jasmine-2.5.2/boot.js')

    console.log("Injecting specs...");
    page.injectJs('specs/BackSeatSessionsSpec.js');

    console.log("Waiting for Jasmine test-suite to finish...");
    waitFor(function(){
        return page.evaluate(function(){
            return (document.body.querySelector('.jasmine-symbol-summary .jasmine-pending') === null &&
                    document.body.querySelector('.jasmine-duration') !== null);
        });
    }, function(){
        var exitCode = page.evaluate(function(){
            console.log('');

            var title = 'Jasmine';
            var version = document.body.querySelector('.jasmine-version').innerText;
            var duration = document.body.querySelector('.jasmine-duration').innerText;
            var banner = title + ' ' + version + ' ' + duration;
            console.log(banner);

            var list = document.body.querySelectorAll('.jasmine-results > .jasmine-failures > .jasmine-spec-detail.jasmine-failed');
            if (list && list.length > 0) {
                console.log('');
                console.log(list.length + ' test(s) FAILED:');
                for (i = 0; i < list.length; ++i) {
                    var el = list[i],
                        desc = el.querySelector('.jasmine-description'),
                        msg = el.querySelector('.jasmine-messages > .jasmine-result-message');
                    console.log('');
                    console.log(desc.innerText);
                    console.log(msg.innerText);
                    console.log('');
                }
                return 1;
            } else {
                console.log(document.body.querySelector('.jasmine-alert > .jasmine-bar.jasmine-passed,.jasmine-alert > .jasmine-bar.jasmine-skipped').innerText);
                return 0;
            }
        });
        phantom.exit(exitCode);
    },
    {
      onTimeOut: function(){
        console.log("Timeout");
        console.log("Jasmine test-suite either taks too long to complete, or was never injected properly.");
        // page.render('timeout.png');
      },
      timeOutMillis: jasmineTimeout
    });
});
