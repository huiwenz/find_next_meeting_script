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

// Helper function for inTodayPage
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

function inTodayPage(desktop) {

    // Find the Day view list
    return Q.fcall(function () {
        return desktop.findFirst(function (el) { return (el.name.indexOf("Day View") > -1); }, 0, 2);
    }).then(function (dayView) {

        // Filter out the next meeting
        var firstMeeting = dayView.firstChild();
        console.log("First meeting is " + firstMeeting.name);

        if ((firstMeeting == null) || (firstMeeting.name.indexOf("Subject") <= -1)) {
            narrator.say("You don't have a meeting today");
            return;
        } else {

            var hasNext = false;

            // Get today's time
            // When the meeting is not the last one --> Usually the last one just shows current time. 
            // Ask about this!!
            while (firstMeeting.nextSibling() != null) {

                var firstMeetingName = firstMeeting.name;

                var startTime = (firstMeetingName.split(" "))[5]; // May need to handle array out of bound exception in here

                // Still need to get current time
                /////////////////////////////////////////////////TBD/////////////////////////////////////////////////
                var curTime = "10:00am"; // This is just for test purpose. We still need a function which shows current time. 
                /////////////////////////////////////////////////TBD/////////////////////////////////////////////////

                console.log("start time is " + startTime);
                var startTimeNum = parseTime(startTime);
                var curTimeNum = parseTime(curTime);

                if (startTimeNum > curTimeNum) {
                    hasNext = true;
                    narrator.say("Your next meeting today is " + firstMeetingName);
                    break;
                }

                firstMeeting = firstMeeting.nextSibling();
            }

            if (!hasNext) {
                narrator.say("You have no meeting left for today.");
            }

        }

    }, function (error) { throw new Error("Can't find Day View list!"); });

}

// A helper function for inCalendarPage
/////////////////////////////////////////////////// NEED TO BE CHANGED ///////////////////////////////////////////////////
function clickHomeTabButton() { 

    return Q.fcall(function () {

        // Click on HOME button
        // One possible test case: What if HOME button is already expanded?
        return uia.root().findFirst(function (el) { return ((el.name == "Home") && (el.className == "NetUIRibbonTab")); }, 0, 10);


    }).then(function (homeButton) {

        // Find SelectionItemPattern

        console.log("getHome");

        homeButton.setFocus();

        console.log(homeButton.getProperty(30036)); // Check if it has the property
        
        // Get the pattern and let it expand
        ////////////////////////////////////////////////////////////////////////////////////////
        // Note: The narrator breaks in this line
        if (homeButton.getProperty(30036)) {

            var selItemPattern = homeButton.getPattern(10010);
            ////////////////////////////////////////////////////////////////////////////////////////
            selItemPattern.select();
        }

    }, function (error) { throw new Error("Can't find HOME button!!"); });

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// An another helper function for inCalendarPage
// Help to switch to Today
function switchToToday(dayButton) {


    // 1.  Click on Day button
    console.log("Find day button");
    console.log(dayButton.getProperty(30041));
    var dayTogglePattern = dayButton.getPattern(10015);
    dayTogglePattern.toggle();

    return Q.fcall(function () {

        return uia.root().findFirst(function (el) { return ((el.name == "Today") && (el.className == "NetUIRibbonButton") && (el.parentNode().name == "Go To")); }, 0, 11);
    }).then(function (todayButton) {

        todayButton.setFocus();

        console.log("on today!!");


        var todayButtonInvokePat = todayButton.getPattern(10000);

        // 2. Click on Today Button
        todayButtonInvokePat.invoke();

        console.log("Today button clicked");

        // Wait for 2 seconds
        host.setTimeout(function () { inTodayPage(uia.root()); }, 2000);


    }, function (error) { throw new Error("Can't find Today button!") });
}

function inCalendarPage(desktop) {

    return Q.fcall(function () {

        // Check if the "Day" button is expanded
        return desktop.findFirst(function (el) { return (el.name == "Day"); }, 0, 11);

    }).then(function (dayButton) {

        // Click on Day button if it is not already be clicked...
        // One test case: If the original focus is not on Day view
        //////////////////////////////////////////////////////// NEED TO BE CHECKED ////////////////////////////////////////////////////////
        if (dayButton == null) {

            // If can't find Day button, then it is possible that the HOME button is not expanded. 
            // Click on the HOME button to expand
            clickHomeTabButton();

            host.setTimeout(function () { switchToToday(dayButton); }, 2000);
            //////////////////////////////////////////////////////// NEED TO BE CHECKED ////////////////////////////////////////////////////////

        } else { // find Day button
            switchToToday(dayButton);
        }

    }, function (error) { throw new Error("Something wrong happens when want to click on Day button!") });

}


host.onKeypress = function (e) {
    console.log("onkeypress");
    console.log(JSON.stringify(e));

    // "1"
    if (e.keyCode === 49) {
        //narrator.say("1 2 3");

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

            }, function (error) { throw new Error("Can't get root value!!"); });

    }

    // "2"
    else if (e.keyCode === 50) {

    }
    // "5"
    else if (e.keyCode === 53) {
        debugger;
    }
};
