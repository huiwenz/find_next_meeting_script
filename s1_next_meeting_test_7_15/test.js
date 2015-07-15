/// <reference path="uia.d.ts" />
"use strict";

function checkForCases() {

    // Case 1: Check if the date is really today's date - Just examine the UI element
    QUnit.test("Case 1", function (assert) {

        var curTime = Date.now();

        // 1. Find the Day view list
        return Q.fcall(function () {
            return uia.root().findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);

        }).then(function (dayView) {
            // Make sure that there is no meeting
            assert.strictEqual(dayView.childNodes().length, 1, "The test for checking the case where there is no meeting passes!");

        }, function (error) { throw new Error("The promise of getting the Day View list fails. "); });


    });


    var narratorOutput; // Get this string that Narrator reads out

    if (narratorOutput === "You don't have a meeting today") {
        // Case 2: There is no meeting for today when the Narrator notifies the user
        // "You have no meeting".

        // Get the day view list on the calendar. Make sure that 
        // There is no meeting
        QUnit.test("Case 2", function (assert) {

            // 1. Find the Day view list
            return Q.fcall(function () {
                return uia.root().findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);

            }).then(function (dayView) {
                // Make sure that there is no meeting
                assert.strictEqual(dayView.childNodes().length, 1, "The test for checking the case where there is no meeting passes!");

            }, function (error) { throw new Error("The promise of getting the Day View list fails. "); });
            

        });

    } else if (narratorOutput === "You have no meeting left for today.") {


        // Case 3: Make sure the last meeting is later than the current time



    } else { // There is a meeting for today

        // Case 4: Check if the Narrator is reading out the message in a correct format
        QUnit.test("Case 3", function (assert) {

            // A correct message must at least contains from.
            assert.ok((narratorOutput.indexOf("from") > -1));

            // A correct message must at least contains to.
            assert.ok((narratorOutput.indexOf("to") > -1));

        });

        // Case 5: Check if the Narrator is really reading out a meeting name inside of the Day View list



    }


}

// doTest: The function for triggering the test
function doTest() {

    // 1. Run the script action when the script is loaded - For scenario 1
    lookupNextMeeting();

    // 2. Check for result after waiting for an enough LONG time
    host.setTimeout(function () { checkForCases(); }, 15000);
}


