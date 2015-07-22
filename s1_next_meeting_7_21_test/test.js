/// <reference path="uia.d.ts" />
"use strict";

////////////////////////////////////////////////////////////////////// HELPER FUNCTIONS //////////////////////////////////////////////////////////////////////

function setupSubjectNLocation() {

    return Q.fcall(function () {

        return uia.root().findFirst(function (el) { return (el.name === "New Appointment"); }, 10, 11);
    })

}


function addOneEventTest() {

    return Q.fcall(function () {
        // We add one event to the event list
        // Find the New Appointment button
        return uia.root().findFirst(function (el) { return (el.name === "New Appointment"); }, 10, 11);
    }).then(function (newAppButton) {

        return newAppButton.getPattern(10000);

    }, function (error) { throw new Error("The promise for finding the new appointment button fails. "); })
    .then(function (newAppButtonInvoke) {

        newAppButtonInvoke.invoke();

        // Wait till the window appears
        host.setTimeout(function () {
            setupSubjectNLocation();
        }, 2000);

    }, function (error) { throw new Error("The promise for finding the invoke pattern of new appointment button fails. "); })

}


function testInAFutureDay() {

    return Q.fcall(function () {
        // First, we want to make sure that we are in 2040!
        return uia.root().findFirst(function (el) { return ((el.className === "NetUILabel") && (el.name.indexOf("2040") > -1)); }, 6, 7);
    }).then(function (dateLabel) {

        if (dateLabel === null) {

            console.log("FROM TEST.JS: You are not in the test date - 2040 yet. We will not do the following tests. ");
            return "Abort";

        } else {

            return "Continue";
        }

    }, function (error) { throw new Error("FROM TEST.JS: The promise for finding the date label fails. "); })
    .then(function (statusStr) {

        if (statusStr === "Abort") {

            // CONTINUE TO PASS THE ABORT STRING
            return statusStr;

        } else {

            // Start to do the test
            // First we find the day view list
            return uia.root().findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);
        }

    }, function (error) { throw new Error("FROM TEST.JS: The promise for passing the first status string fails. "); })

    .then(function (dayViewList) {

        // Make sure that there is no meetings. (Yes it's possible to have meetings.)
        // And we just assume the user doesn't care whether there is a meeting or not in a future that is THIS far. :)


        ///////////////////////////////////////////////////////////// TODO /////////////////////////////////////////////////////////////
        // Clean up the meetings on that FUTURE day
        // DO I NEED TO MANUALLY DELETE ALL THE MEETINGS?

        ///////////////////////////////////////////////////////////// NOW /////////////////////////////////////////////////////////////
        // There is no meetings
        inTodayPage();

        // Wait for the function call to complete, and check the result
        // 30 seconds?
        host.setTimeout(function () {

            ///////////////////////////////////////////////////////////// TODO /////////////////////////////////////////////////////////////
            // Get the sentence that narrator says
            var narratorSentence;

            // The narrator should say that there is no meeting.
            QUnit.test("Test for no meeting", function (assert) {
                assert.strictEqual(narratorSentence, "You don't have a meeting today", "FROM TEST.JS: RESULT OF ASSERTION");
            });


        }, 30000);

        return "Fulfilled";

    }, function (error) { throw new Error("FROM TEST.JS: The promise for getting the day view list fails. "); })

}

function testInGoToDate() {

    return Q.fcall(function () {
        // Find the text area inside of Go To Date window
        return uia.root().findFirst(function (el) { return ((el.name === "Date:") && (el.className === "RichEdit20WPT")); }, 2, 3);
    }).then(function (enterDateText) {

        console.log("ISVALUEPATTERNAVAILABLE: " + enterDateText.getProperty(30043));
        // Find the value pattern
        return enterDateText.getPattern(10002);

    }, function (error) { throw new Error("The promise for finding the text area of Go To Date window fails. "); })
    .then(function (valuePatternDateText) {

        // Enter a date which is FAR FAR AWAY
        valuePatternDateText.setValue("7/23/2040"); // This is not a weekend

        // Press the OK button
        return uia.root().findFirst(function (el) { return ((el.name === "OK") && (el.className === "Button")); }, 2, 3);

    }, function (error) { throw new Error("The promise for finding the value pattern of Date text field fails."); })
    .then(function (okButton) {

        return okButton.getPattern(10000);

    }, function (error) { throw new Error("The promise for finding the OK button fails. "); })
    .then(function (invokePatOkBut) {

        invokePatOkBut.invoke();

        // Wait for 2 seconds for the Go to Date window popping up
        host.setTimeout(function () { testInAFutureDay(); }, 2000);

        return "Fulfilled";

    }, function (error) { throw new Error("The promise for finding the invoke pattern of OK button fails. "); });
}


function testInCalendarPage() {

    return Q.fcall(function () {

        // Get go to date button
        return uia.root().findFirst(function (el) { return (el.name === "Go to Date..."); }, 10, 11);

    }).then(function (goDateButton) {

        // Find the invoke pattern
        return goDateButton.getPattern(10000);

    }, function (error) { throw new Error("The promise for finding the Go to Date button fails. "); })
    .then(function (goDateButtonInvokePat) {

        goDateButtonInvokePat.invoke();

        // Wait for 2 seconds for the Go to Date window popping up
        host.setTimeout(function () { testInGoToDate(); }, 2000);

        return "Fulfilled";

    }, function (error) { throw new Error("The promise for finding the invoke pattern of go to date pattern fails. "); })
   

}

////////////////////////////////////////////////////////////////////// MAIN TEST FUNCTION //////////////////////////////////////////////////////////////////////
function testForNextMeetingScenario() {

    // Outlook is already there, we jump to a day which is 
    // far far away from now

    return Q.fcall(function () {
        return uia.root().findFirst(function (el) { return (el.name === "Calendar"); }, 0, 3);
    }).then(function (calendarButton) {

        // Get invoke Pattern
        return calendarButton.getPattern(10000);

    }, function (error) { throw new Error("The promise for finding the calendar button fails."); })

        .then(function (calendarInvoke) {

            // Click on the Calendar tab button
            calendarInvoke.invoke();

            // Wait 2 seconds till we jump to the Calendar page
            host.setTimeout(function () { testInCalendarPage(); }, 2000);

            return "Fulfilled";

    }, function (error) { throw new Error("The promise for finding the invoke pattern of calendar button fails. "); });

}


////////////////////////////////////////////////////////////////////// CALL THE TEST FUNCTION //////////////////////////////////////////////////////////////////////
testForNextMeetingScenario();


//console.log("OPENEEDDD");
//console.log("ASDFASDFASDFASD");
//console.log("ASDFASDFASDFASD");
//console.log("ADSFASDFASDFASDFASDFASD");
//console.log("WWWWWWWWWWWWWWWWW");
//console.log("Done");

// A simple test
QUnit.test("Ok test", function (assert) {

    assert.ok(true, "true succeeds");
});

host.onActivate = function () {
    console.log("onActivate");
};

host.onDeactivate = function () {
    console.log("onDeactivate");
};

host.onSetFocus = function () {
    console.log("onSetFocus");

    var el = uia.focused();

    console.log("name: \"" + el.name + "\"");
    console.log("class name: \"" + el.className + "\"");
    console.log("id: " + el.id);
    console.log("automationid: " + el.automationid);

};

host.onKillFocus = function () {
    console.log("onKillFocus");
}

host.onKeypress = function (e) {
    console.log("onkeypress");
    console.log(JSON.stringify(e));
};




