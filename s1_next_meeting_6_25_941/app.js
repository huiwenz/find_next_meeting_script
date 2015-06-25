/// <reference path="uia.d.ts" />

host.onActivate = function () {
    console.log("onActivate");
};

host.onDeactivate = function () {
    console.log("onDeactivate");
};

host.onSetFocus = function () {
    //console.log("onSetFocus");

    //var el = uia.focused();

    //console.log("name: \"" + el.name + "\"");
    //console.log("class name: \"" + el.className + "\"");
    //console.log("id: " + el.id);
    //console.log("automationid: " + el.automationid);

};

host.onKillFocus = function () {
    console.log("onKillFocus");
}


/////////////////////////////////////////////////////////// BUGGY FUNCTION /////////////////////////////////////////////////////////////
function clickHomeTabButton() {

    return Q.fcall(function () {

        // Click on HOME button
        return uia.root().findFirst(function (el) { return ((el.name == "Home") && (el.className == "NetUIRibbonTab")); }, 0, 10);


    }).then(function (homeButton) {

        // Find SelectionItemPattern

        console.log("getHome");

        homeButton.setFocus();

        console.log(homeButton.getProperty(30036)); // Check if it has the property

        // Get the pattern and let it expand
        ///////////////////////////////////////////// BUGGY ///////////////////////////////////////////
        if (homeButton.getProperty(30036)) {

            var selItemPattern = homeButton.getPattern(10010);
            ////////////////////////////////////////////////////////////////////////////////////////
            selItemPattern.select();
        }

    }, function (error) { throw new Error("Can't find HOME button!!"); });

}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////
// parseTime: A helper function for inTodayPage, which parses a time string into a number
// so that we can compare times.
function parseTime(time) {

    var strNum;
    var hrs;
    var apchar;

    var minNum;

    console.log("parsing time infos");

    if (time.length == 7) {
        strNum = time.substring(0, 5);
        hrs = time.substring(0, 2);
        apchar = time.charAt(5);
        minNum = parseInt(time.substring(3, 5));
    } else {
        strNum = time.substring(0, 4);
        hrs = time.substring(0, 1);
        apchar = time.charAt(4);
        minNum = parseInt(time.substring(2, 4));
    }

    var hrsnum = parseInt(hrs);

    if (apchar == 'p') {
        hrsnum += 12;
    }

    // Convert the final result into a number
    return hrsnum * 100 + minNum;

}

//////////////////////////////////////////////////////////////////////////////////
// getCurrentTime: A helper function that returns current time
// And parse it to a number
function getCurrentTime() {

    var currentdate = new Date();

    var curDateTimeNum = parseInt(currentdate.getHours()) * 100 + parseInt(currentdate.getMinutes());

    return curDateTimeNum;

}

//////////////////////////////////////////////////////////////////////////////////
// inTodayPage: A helper function for switchToToday which continues all the subsequent
// steps after we are in Today page. 
function inTodayPage(desktop) {

    // 1. Find the Day view list
    return Q.fcall(function () {
        return desktop.findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);

    }).then(function (dayView) {

        // 2. Filter out the next meeting
        // We check from the very first meeting on today 
        var firstMeeting = dayView.firstChild();
        console.log("First meeting is " + firstMeeting.name);

        if ((firstMeeting == null) || (firstMeeting.name.indexOf("Subject") <= -1)) {

            // There is no first meeting --> There is no meeting for today
            narrator.say("You don't have a meeting today");

        } else { // We have a first meeting. 

            var hasNext = false;

            while (firstMeeting.nextSibling() != null) { // While loop 

                var firstMeetingName = firstMeeting.name;

                if (firstMeetingName != null) {

                    var firstMeetingNameArray = firstMeetingName.split(" ");

                    if (firstMeetingNameArray.length > 8) { // Minimum length of the meeting name should be 8

                        var startTime = firstMeetingNameArray[5];

                        var startTimeNum = parseTime(startTime);
                        var curTimeNum = getCurrentTime();

                        console.log("startTimeNum: " + startTimeNum);
                        console.log("curTimeNum: " + curTimeNum);

                        if (startTimeNum >= curTimeNum) {
                            hasNext = true;
                            narrator.say("Your next meeting today is " + firstMeetingName);
                            break;
                        }

                    } else {
                        throw new Error("There is something wrong in the name of the first meeting.");
                    }

                } else {
                    throw new Error("Unable to get the name of the first meeting. Something wrong happened.");
                }

                firstMeeting = firstMeeting.nextSibling();
            }

            if (!hasNext) {
                narrator.say("You have no meeting left for today.");
            }

        }

    }, function (error) { throw new Error("The promise of getting the Day View list fails. "); });

}

//////////////////////////////////////////////////////////////////////////////////
// switchToToday: A helper function for inCalendarPage, which helps to click on Today button
function switchToToday(desktop, dayButton) {


    // 1.  Click on Day button
    return Q.fcall(function () {

        return dayButton.getPattern(10015);

    }).then(function (dayTogglePattern) {

        dayTogglePattern.toggle();

        // 2. Find Today button
        return desktop.findFirst(function (el) { return ((el.name == "Today") && (el.className == "NetUIRibbonButton") && (el.parentNode().name == "Go To")); }, 0, 11);

    }, function (error) { throw new Error("The promise of getting toggle pattern from Day button fails. "); })

    .then(function (todayButton) {

        return todayButton.getPattern(10000);


    }, function (error) { throw new Error("The promise of getting Today button from root element fails. ") })
    .then(function (todayButtonInvokePat) {

        // 3. Click on Today Button
        todayButtonInvokePat.invoke();

        console.log("Today button clicked");

        // Wait for 2 seconds to make sure that we are in Today's page
        host.setTimeout(function () { inTodayPage(desktop); }, 2000);

    }, function (error) { throw new Error("The promise of getting invoke pattern from Today button fails. ") });
}

//////////////////////////////////////////////////////////////////////////////////
// inCalendarPage: The subsequent steps after we change to Calendar tab
function inCalendarPage(desktop) {

    return Q.fcall(function () {

        // 1. Locate Day button
        return desktop.findFirst(function (el) { return (el.name == "Day"); }, 0, 11);

    }).then(function (dayButton) {

        // 2. Click on Day button
        //////////////////////////////////////////////////////// NEED TO BE CHECKED ////////////////////////////////////////////////////////
        if (dayButton == null) {

            // If can't find Day button, then it is possible that the HOME button is not expanded. 
            // Click on the HOME button to expand
            clickHomeTabButton();

            host.setTimeout(function () { switchToToday(dayButton); }, 2000);
            //////////////////////////////////////////////////////// NEED TO BE CHECKED ////////////////////////////////////////////////////////

        } else { // find Day button. 

            // NOTE: Here we just assume that the HOME tab is already expanded. So for now only this 
            // branch will work. 
            switchToToday(desktop, dayButton);
        }

    }, function (error) { throw new Error("The promise of finding Day button is rejected!") });

}


host.onKeypress = function (e) {
    console.log("onkeypress");
    console.log(JSON.stringify(e));

    // "1"
    // Shortcut key for scenario 1: Looking up next meeting today

    if (e.keyCode === 49) {

        return Q.fcall(function () {
            return uia.root(); 
        })

        .then(function (desktop) {

                // Find the Calendar tab button
                return Q.fcall(function () {

                    return desktop.findFirst(function (el) { return (el.name == "Calendar"); }, 0, 3);

                }).then(function (calendarButton) {
        
                    return Q.fcall(function () {

                        // Get invoke Pattern
                        return calendarButton.getPattern(10000);

                    }).then(function (calendarInvoke) {

                        return Q.fcall(function () {

                            // Click on the Calendar tab button
                            calendarInvoke.invoke();

                            // Wait 2 seconds till we jump to the Calendar page
                            host.setTimeout(function () { inCalendarPage(desktop); }, 2000);

                        });

                    }, function (error) { throw new Error("Can't get access to the invoke pattern!!"); });

                }, function (error) { throw new Error("Can't access to the calendar tab button!"); });

            }, function (error) { throw new Error("Can't get the UIA root value!!"); });

    }

    // "2"
    else if (e.keyCode === 50) {

    }
    // "5"
    else if (e.keyCode === 53) {
        debugger;
    }
};
