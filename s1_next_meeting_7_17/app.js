/// <reference path="uia.d.ts" />
"use strict";

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

//////////////////////////////////////////////////// HELPER FUNCTIONS ////////////////////////////////////////////////////

// inTodayPage: A helper function for switchToToday which continues all the subsequent
// steps after we are in Today page. 
function inTodayPage() {

    // 1. Find the Day view list
    return Q.fcall(function () {
        return uia.root().findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);

    }).then(function (dayView) {

        // 2. Filter out the next meeting

        // - First check if there is no meeting for today
        // If there is no meeting, then the Day View will only have one
        // child, with a meeting that has no subject

        if (dayView.childNodes().length <= 1) {

            narrator.say("You don't have a meeting today");

        } else { // We have meetings!

            var firstMeeting = dayView.firstChild();

            // We are reading out all next meetings which are overlapped together
            // until we reach a block of free time. 
            var nextMeeting = [];

            var findFirst = false; // The boolean for marking whether you've found a first meeting or not

            var previousMeetingEndTime; // A variable for checking meeting overlaps.

            // Get the milliseconds elapsed for current time
            // To make sure this number is stable(cuz it's increasing in ms), we get a fixed value of time in here.
            var currentTimeValue = Date.now();

            while (firstMeeting.nextSibling() !== null) {

                var firstMeetingName = firstMeeting.name;

                if (firstMeetingName !== null) {

                    // Parse the starting time of first meeting 
                    var firstMeetingNameArray = firstMeetingName.split(","); // By comma to get the date string

                    // Get the start time string which contains start and end time, should be the third one
                    var startFromTimeStr = firstMeetingNameArray[2];
                    // Get only the start time
                    var startTime = startFromTimeStr.split(" ")[3];

                    // Create the time string, in a format that Date module likes
                    var timeString = firstMeetingNameArray[0] + ", " + firstMeetingNameArray[1] + ", " + startTime;

                    var meetingParsedStartTimeValue = Date.parse(timeString);

                    if (!findFirst) { // Haven't found the first next meeting yet

                        // Note: Currently, we only check the meetings that are happening
                        // after current time, and we DON'T CARE if we are CURRENTLY in a 
                        // meeting or not
                        if (meetingParsedStartTimeValue >= currentTimeValue) {
                            // Push the next meeting into the array!
                            nextMeeting.push(firstMeetingName);
                            findFirst = true;

                            // Initialize the previous meeting end time variable
                            var endTime = startFromTimeStr.split(" ")[6];

                            previousMeetingEndTime = Date.parse(firstMeetingNameArray[0] + ", " + firstMeetingNameArray[1] + ", " + endTime);
                        }

                    } else { // Already found the first next meeting. 

                        // Check for overlaps
                        if (previousMeetingEndTime !== null) {

                            if (meetingParsedStartTimeValue <= previousMeetingEndTime) {
                                nextMeeting.push(firstMeetingName); // There is an overlap. Push the time.
                                // And update previous meeting end time variable
                                var endTime = startFromTimeStr.split(" ")[5];
                                var meetingEndTime = Date.parse(firstMeetingNameArray[0] + ", " + firstMeetingNameArray[1] + ", " + endTime);
                                if (meetingEndTime > previousMeetingEndTime) {
                                    // We only update the previous meeting end time if we find a overlapped
                                    // meeting that is gonna end later than the previous meeting end time
                                    // that we found
                                    previousMeetingEndTime = meetingEndTime;
                                }
                            } else {
                                break;  // There is no overlap. 
                            }

                        }

                    }



                } else {
                    // There might be an error. 
                    narrator.say("Unable to get the name of the first meeting. Please try again. ");
                    console.log("Unable to get the name of the first meeting. Something wrong happened.");
                }

                firstMeeting = firstMeeting.nextSibling();

            }

            // Reading out all next meetings
            if (nextMeeting.length > 0) {

                var narratorReport = "Here are your next meetings: ";

                for (var i = 0; i < nextMeeting.length; i++) {

                    narratorReport += ("\n" + nextMeeting[i]);
                }

                // Read out all next meetings
                narrator.say(narratorReport);
                console.log("REPORT!! \n" + narratorReport); // This is for debugging purposes
            
            } else {
                narrator.say("You have no meeting left for today.");
            }


        }

        // Promise needs to return
        return "Fulfilled";

    }, function (error) { throw new Error("The promise of getting the Day View list fails. "); });

}

//////////////////////////////////////////////////////////////////////////////////
// switchToToday: A helper function for inCalendarPage, which helps to click on Today button
function switchToToday(dayButton) {

    // 1.  Click on Day button
    return Q.fcall(function () {

        return dayButton.getPattern(10015);

    }).then(function (dayTogglePattern) {

        dayTogglePattern.toggle();

        // 2. Find Today button
        return uia.root().findFirst(function (el) {
            return ((el.name === "Today") && (el.className === "NetUIRibbonButton") && (el.parentNode().name === "Go To"));
        }, 0, 11);

    }, function (error) { throw new Error("The promise of getting toggle pattern from Day button fails. "); })

    .then(function (todayButton) {
        return todayButton.getPattern(10000);
    }, function (error) { throw new Error("The promise of getting Today button from root element fails. ") })

    .then(function (todayButtonInvokePat) {

        // 3. Click on Today Button
        todayButtonInvokePat.invoke();

        // Wait for 2 seconds to make sure that we are in Today's page
        host.setTimeout(function () { inTodayPage(); }, 2000);

        // Promise needs to return 
        return "Fulfilled";

    }, function (error) { throw new Error("The promise of getting invoke pattern from Today button fails. ") });
}

//////////////////////////////////////////////////////////////////////////////////
// inCalendarPage: The subsequent steps after we change to Calendar tab
function inCalendarPage() {

    return Q.fcall(function () {

        // 1. Locate Day button
        return uia.root().findFirst(function (el) { return (el.name === "Day"); }, 0, 11);

    }).then(function (dayButton) {

        // Assume Day button is there, and HOME button is fully expanded
        switchToToday(dayButton);

        // Promise needs to return 
        return "Fulfilled";

    }, function (error) { throw new Error("The promise of finding Day button is rejected!") });

}

//////////////////////////////////////////////////////////////////////////////////
// lookUpNextMeeting: The function which contains all the steps for looking up
// the next meeting
function lookupNextMeeting() {

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
        host.setTimeout(function () { inCalendarPage(); }, 2000);

        return "Fulfilled";

    }, function (error) { throw new Error("The promise for finding the invoke pattern of calendar button fails. "); });

}



host.onKeypress = function (e) {
    console.log("onkeypress");
    console.log(JSON.stringify(e));

    // "1"
    // Shortcut key for scenario 1: Looking up next meeting today
    if (e.keyCode === 49) {

        lookupNextMeeting();

    }

    // "2"
    else if (e.keyCode === 50) {

    }
    // "5"
    else if (e.keyCode === 53) {
        debugger;
    }
};
