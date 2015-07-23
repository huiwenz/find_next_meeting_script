/// <reference path="uia.d.ts" />
"use strict";

////////////////////////////////////////////////////////////////////// HELPER FUNCTIONS //////////////////////////////////////////////////////////////////////

function testInAPastDay() {

    // Add the event
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

            // Take in a function
            setupSubjectNLocationForMeeting("9:00 AM", "10:00 AM", "Meeting X - NARRATOR SCRIPT TEST", "Room X",

            // Callback function which helps us to do the test
            function () {

                inTodayPage();

                // Wait till the operation to finish
                host.setTimeout(function () {
                    ///////////////////////////////////////////////////////////// TODO /////////////////////////////////////////////////////////////
                    // Get the sentence that narrator says
                    var narratorSentence;

                    // For QUnit testing
                    QUnit.test("Test for adding a meeting before current time", function (assert) {

                        // Test the output has all the necessary components
                        assert.strictEqual(narratorSentence, "You have no meeting left for today.");

                    });

                    // Clean up
                    return Q.fcall(function () {
                        return uia.root().findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);

                    }).then(function (dayViewList) {

                        var meetingsList = dayViewList.childNodes();

                        for (var i = 0; i < meetingsList.length - 1; i++) {

                            var meetingNode = meetingsList[i];

                            if (meetingNode.name.indexOf("Meeting X - NARRATOR SCRIPT TEST")) {
                                removeAMeetingNode(meetingNode);
                            }
                            
                        }

                        // Wait till the clean up to finish, and we are done --> Need to inform the external reader
                        host.setTimeout(function () { console.log("Done"); }, 10000);

                    }, function (error) { throw new Error("The promise of getting the Day View list fails. "); });

                }, 30000);

            });

        }, 2000);

    }, function (error) { throw new Error("The promise for finding the invoke pattern of new appointment button fails. "); });
}

// Another case: There is a meeting before current time, and you don't want to tell that one to the user
function addAnEventBeforeCurTime() {

    // Jump to a date which is before cur date
    testInCalendarPage("4/1/2015", testInAPastDay);

}


// The function for filling up the location and subject of an appointment
function setupSubjectNLocationForMeeting(startTime, endTime, meetingName, meetingRoom, testCallbackFunc) {

    return Q.fcall(function () {

        return uia.root().findFirst(function (el) { return ((el.name === "Subject") && (el.className === "RichEdit20WPT")); }, 4, 5);

    }).then(function (subjectField) {

        // Find the value pattern
        return subjectField.getPattern(10002);

    }, function (error) { throw new Error("The promise for finding the subject edit field fails. "); })

    .then(function (subjectFieldValuePattern) {

        // Set subject
        subjectFieldValuePattern.setValue(meetingName);

        // Find the location field
        return uia.root().findFirst(function (el) { return ((el.name === "Location") && (el.className === "REComboBox20W")); }, 4, 5);

    }, function (error) { throw new Error("The promise for finding the value pattern of subject field fails. ") })

    .then(function (locationField) {

        return locationField.getPattern(10002);

    }, function (error) { throw new Error("The promise for finding the location field fails."); })

    .then(function (locationFieldValuePattern) {

        locationFieldValuePattern.setValue(meetingRoom);

        // Find the Start time field and set it up.
        return uia.root().findFirst(function (el) { return ((el.name === "Start time") && (el.className === "RichEdit20WPT")); }, 4, 5);

    }, function (error) { throw new Error("The promise for finding the value pattern of the location field fails. "); })

    .then(function (startTimeField) {

        return startTimeField.getPattern(10002);

    }, function (error) { throw new Error("The promise for finding the start time field fails. "); })

    .then(function (startTimeValuePattern) {

        startTimeValuePattern.setValue(startTime);

        // Find the end time field
        return uia.root().findFirst(function (el) { return ((el.name === "End time") && (el.className === "RichEdit20WPT")); }, 4, 5);

    }, function (error) { throw new Error("The promise for finding the value pattern of start time field. "); })

    .then(function (endTimeField) {
        return endTimeField.getPattern(10002);
    }, function (error) { throw new Error("The promise for finding the end time field fails. ") })

    .then(function (endTimeFieldValuePattern) {

        endTimeFieldValuePattern.setValue(endTime);

        // Find save & close button
        return uia.root().findFirst(function (el) { return ((el.name === "Save & Close") && (el.className === "NetUIRibbonButton")); }, 10, 11);

    }, function (error) { throw new Error("The promise for finding the value pattern of the end time fails. "); })

    .then(function (saveCloseButton) {

        return saveCloseButton.getPattern(10000);

    }, function (error) { throw new Error("The promise for finding the save & close button fails. "); })

    .then(function (saveCloseInvokePat) {

        saveCloseInvokePat.invoke();
        host.setTimeout(function () { testCallbackFunc(); }, 2000);
        

    }, function (error) { throw new Error("The promise for finding the invoke pattern of save & close pattern fails. "); });

}

function removeAMeetingNode(meetingNode) {

    return Q.fcall(function () {

        // Get the invoke pattern
        return meetingNode.getPattern(10000);

    }).then(function (meetingNodeInvokePattern) {

        meetingNodeInvokePattern.invoke();

        host.setTimeout(function () {

            return Q.fcall(function () {
                
                // Get the delete button
                return uia.root().findFirst(function (el) { return ((el.name === "Delete") && (el.className === "NetUIRibbonButton")); }, 9, 11);
            }).then(function (deleteButton) {

                return deleteButton.getPattern(10000);

            }, function (error) { throw new Error("The promise for finding the delete button of the meeting node window fails. "); })

            .then(function (deleteButtonInvokePat) {

                deleteButtonInvokePat.invoke();


            }, function (error) { throw new Error("The promise for finding the invoke pattern of delete button fails. "); })

        }, 2000);

    }, function (error) { throw new Error("The promise for finding the invoke pattern of meeting node fails. "); })

}


// A helper function for cleaning up all meetings on that far far away future
function cleanUpAllMeetings() {

    // Get the day view list on that day
    return Q.fcall(function () {
        return uia.root().findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);

    }).then(function (dayViewList) {

        var meetingsList = dayViewList.childNodes();

        for (var i = 0; i < meetingsList.length - 1; i++) {

            var meetingNode = meetingsList[i];
            removeAMeetingNode(meetingNode);

        }

    }, function (error) { throw new Error("The promise of getting the Day View list fails. "); });

}



function addAnotherEventWithoutOverlapTest() {

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

            // Take in a function
            setupSubjectNLocationForMeeting("12:30 AM", "1:00 AM", "Meeting 3", "Room 3",

            // Callback function which helps us to do the test
            function () {

                inTodayPage();

                // Wait till the operation to finish
                host.setTimeout(function () {
                    ///////////////////////////////////////////////////////////// TODO /////////////////////////////////////////////////////////////
                    // Get the sentence that narrator says
                    var narratorSentence;

                    // For QUnit testing
                    // Should read out the information for both of the two meetings
                    QUnit.test("Test for 3 meetings left - 2 with conflicts", function (assert) {

                        var meetingResultArray = narratorSentence.split("\n");

                        // Make sure that it is the sentence of the result
                        if (meetingResultArray.length < 3) {
                            assert.ok(false, "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - LESS THAN 2 MEETINGS ARE ACTUALLY REPORTED");

                        } else if (meetingResultArray.length > 3) {

                            assert.ok(false, "FROM TEST.JS: TEST FOR 2 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - MORE THAN 2 MEETINGS ARE ACTUALLY REPORTED");

                        } else {

                            // Test the output has all the necessary components
                            assert.strictEqual(meetingResultArray[0], "Here are your next meetings: ", "FROM TEST.JS: RESULT OF ASSERTION");

                            // First meeting
                            assert.ok(meetingResultArray[1].indexOf("July 23, 2040,  from 9:00am to  10:00am") > -1,
                                "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");
                            assert.ok(meetingResultArray[1].indexOf("Subject Meeting 1, Location Room 1") > -1,
                                "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");
                            assert.ok(meetingResultArray[1].indexOf("Organizer") > -1,
                                "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");
                            assert.ok(meetingResultArray[1].indexOf("              Time") > -1,
                                "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");


                            // Second meeting
                            assert.ok(meetingResultArray[2].indexOf("July 23, 2040,  from 9:30am to  10:20am") > -1,
                                "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");
                            assert.ok(meetingResultArray[2].indexOf("Subject Meeting 2, Location Room 2") > -1,
                                "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");
                            assert.ok(meetingResultArray[2].indexOf("Organizer") > -1, "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");
                            assert.ok(meetingResultArray[2].indexOf("Time") > -1, "FROM TEST.JS: TEST FOR 3 MEETINGS LEFT - 2 WITH CONFLICTS FAILS - RESULT OF ASSERTION");

                        }

                    });

                    cleanUpAllMeetings();

                    // Do next test - A meeting before
                    // Wait till all events are cleaned up
                    host.setTimeout(function () { addAnEventBeforeCurTime(); }, 10000);
                    

                }, 30000);

            });

        }, 2000);

    }, function (error) { throw new Error("The promise for finding the invoke pattern of new appointment button fails. "); });

}

function addAnotherEventWithOverlapTest() {

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

            // Take in a function
            setupSubjectNLocationForMeeting("9:30 AM", "10:20 AM", "Meeting 2", "Room 2",

                // Callback function which helps us to do the test
                function () {

                    inTodayPage();

                    // Wait till the operation to finish
                    host.setTimeout(function () {
                        ///////////////////////////////////////////////////////////// TODO /////////////////////////////////////////////////////////////
                        // Get the sentence that narrator says
                        var narratorSentence;

                        // For QUnit testing
                        // Should read out the information for both of the two meetings
                        QUnit.test("Test for 2 meetings left - with conflicts", function (assert) {

                            var meetingResultArray = narratorSentence.split("\n");

                            // Make sure that it is the sentence of the result
                            if (meetingResultArray.length < 3) {

                                assert.ok(false, "FROM TEST.JS: TEST FOR 2 MEETINGS LEFT - WITH CONFLICTS FAILS - LESS THAN 2 MEETINGS ARE ACTUALLY REPORTED");

                            } else if (meetingResultArray.length > 3) {
                            
                                assert.ok(false, "FROM TEST.JS: TEST FOR 2 MEETINGS LEFT - WITH CONFLICTS FAILS - MORE THAN 2 MEETINGS ARE ACTUALLY REPORTED");

                            } else {

                                // Test the output has all the necessary components
                                assert.strictEqual(meetingResultArray[0], "Here are your next meetings: ", "FROM TEST.JS: RESULT OF ASSERTION");

                                // First meeting
                                assert.ok(meetingResultArray[1].indexOf("July 23, 2040,  from 9:00am to  10:00am") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                                assert.ok(meetingResultArray[1].indexOf("Subject Meeting 1, Location Room 1") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                                assert.ok(meetingResultArray[1].indexOf("Organizer") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                                assert.ok(meetingResultArray[1].indexOf("Time") > -1, "FROM TEST.JS: RESULT OF ASSERTION");


                                // Second meeting
                                assert.ok(meetingResultArray[2].indexOf("July 23, 2040,  from 9:30am to  10:20am") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                                assert.ok(meetingResultArray[2].indexOf("Subject Meeting 2, Location Room 2") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                                assert.ok(meetingResultArray[2].indexOf("Organizer") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                                assert.ok(meetingResultArray[2].indexOf("Time") > -1, "FROM TEST.JS: RESULT OF ASSERTION");

                            }



                        });

                        // Next round - Adding one more meeting -- Without conflict
                        addAnotherEventWithoutOverlapTest();

                    }, 30000);

                });


        }, 2000);

    }, function (error) { throw new Error("The promise for finding the invoke pattern of new appointment button fails. "); });

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

            // Take in a function
            setupSubjectNLocationForMeeting("9:00 AM", "10:00 AM", "Meeting 1", "Room 1",

                // Callback function which helps us to do the test
                function () {

                    inTodayPage();

                    // Wait till the operation to finish
                    host.setTimeout(function () {
                        ///////////////////////////////////////////////////////////// TODO /////////////////////////////////////////////////////////////
                        // Get the sentence that narrator says
                        var narratorSentence;

                        // For QUnit testing
                        QUnit.test("Test for 1 meeting left(no conflicts)", function (assert) {

                            // Test the output has all the necessary components
                            assert.ok(narratorSentence.indexOf("July 23, 2040,  from 9:00am to  10:00am") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                            assert.ok(narratorSentence.indexOf("Subject Meeting 1, Location Room 1") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                            assert.ok(narratorSentence.indexOf("Organizer") > -1, "FROM TEST.JS: RESULT OF ASSERTION");
                            assert.ok(narratorSentence.indexOf("Time") > -1, "FROM TEST.JS: RESULT OF ASSERTION");

                        });

                        // Next round: Adding one more meeting - with conflict
                        addAnotherEventWithOverlapTest();

                    }, 30000);

                });

        }, 2000);

    }, function (error) { throw new Error("The promise for finding the invoke pattern of new appointment button fails. "); });

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

                // Next round of test: Adding one event
                addOneEventTest();

            });



        }, 30000);

        return "Fulfilled";

    }, function (error) { throw new Error("FROM TEST.JS: The promise for getting the day view list fails. "); })

}


// Helper function for testInCalendarPage
function testInGoToDate(dateStr, subsequentTestCallBack) {

    return Q.fcall(function () {

        // Find the text area inside of Go To Date window
        return uia.root().findFirst(function (el) { return ((el.name === "Date:") && (el.className === "RichEdit20WPT")); }, 2, 3);

    }).then(function (enterDateText) {

        // Find the value pattern
        return enterDateText.getPattern(10002);

    }, function (error) { throw new Error("The promise for finding the text area of Go To Date window fails. "); })
    .then(function (valuePatternDateText) {

        // Enter a date which is FAR FAR AWAY
        // valuePatternDateText.setValue("7/23/2040"); // This is not a weekend
        valuePatternDateText.setValue(dateStr);

        // Press the OK button
        return uia.root().findFirst(function (el) { return ((el.name === "OK") && (el.className === "Button")); }, 2, 3);

    }, function (error) { throw new Error("The promise for finding the value pattern of Date text field fails."); })

    .then(function (okButton) {

        return okButton.getPattern(10000);

    }, function (error) { throw new Error("The promise for finding the OK button fails. "); })

    .then(function (invokePatOkBut) {

        invokePatOkBut.invoke();

        // Wait for 2 seconds for the Go to Date window popping up
        host.setTimeout(function () { subsequentTestCallBack(); }, 2000);

        //host.setTimeout(function () { testInAFutureDay(); }, 2000);

        return "Fulfilled";

    }, function (error) { throw new Error("The promise for finding the invoke pattern of OK button fails. "); });
}

// This function is for jumping to a specified date when you are in Calendar tab. Also 
// you need to provide necessary subsequent actions.
function testInCalendarPage(dateStr, subsequentTestCallBack) {

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
        host.setTimeout(function () { testInGoToDate(dateStr, subsequentTestCallBack); }, 2000);

        return "Fulfilled";

    }, function (error) { throw new Error("The promise for finding the invoke pattern of go to date pattern fails. "); });


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
            host.setTimeout(function () { testInCalendarPage("7/23/2040", testInAFutureDay); }, 2000);

            return "Fulfilled";

        }, function (error) { throw new Error("The promise for finding the invoke pattern of calendar button fails. "); });

}


////////////////////////////////////////////////////////////////////// CALL THE TEST FUNCTION //////////////////////////////////////////////////////////////////////
testForNextMeetingScenario();




