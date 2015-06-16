/// <reference path="scripts/typings/underscore/underscore.d.ts" />
/// <reference path="scripts/typings/q/q.d.ts" />
/// <reference path="scripts/typings/uia/uia.d.ts" />
host.onload = function () {
    console.log("onload");
};

function printElementDescription(el) {
    console.log("name: \"" + el.name + "\"");
    console.log("class name: \"" + el.className + "\"");
    console.log("id: " + el.id);
    console.log("automationid: " + el.automationid);
}


// Helper function for inTodayPage
function parseTime(time) {

    var strNum;
    var hrs;
    var apchar;

    var minNum;

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

        if ((firstMeeting == null) || (firstMeeting.name.indexOf("Subject") <= -1)) {
            Narrator.say("You don't have a meeting today");
            return;
        } else {

            var hasNext = false;

            // Get today's time

            // Go through the children and find the time
            while (firstMeeting != null) {

                var firstMeetingName = firstMeeting.name;

                var startTime = (firstMeetingName.split(" "))[4]; // May need to handle array out of bound exception in here


                // TBD: A function that can help to get current time
                // Compare the time
                var startTimeNum = parseTime(startTime);
                var curTimeNum = parseTime(curTime);



                if (startTimeNum > curTimeNum) {
                    hasNext = true;
                    Narrator.say("Your next meeting today is " + firstMeetingName);
                    break;

                }

                firstMeeting = firstMeeting.nextSibling();
            }

            if (!hasNext) {
                Narrator.say("You have no meeting left for today.");
            }

        }

    }, function (error) { throw new Error("Can't find Day View list!"); });

}

function inCalendarPage(desktop) {

    return Q.fcall(function () {

        // Click on HOME button
        // One possible test case: What if HOME button is already expanded?
        console.log("heree");
        return desktop.findFirst(function (el) { return (el.name == "Home"); }, 0, 9);


    }).then(function (homeButton) {

        // Find SelectionItemPattern
        return Q.fcall(function () {

            console.log("getHome");

            return homeButton.getPattern(10010);

        }).then(function (selItemPattern) {
            
            console.log("before clicking");

            selItemPattern.select();
            
            // Add a log to check if the HOME button is selected or not
            console.log("HOME button selected");

            return Q.fcall(function () {

                // Check if the "Day" button is expanded
                return desktop.findFirst(function (el) { return (el.name == "Day"); }, 0, 11);
            }).then(function (dayButton) {

                // Click on Day button if it is not already be clicked...
                // One test case: If the original focus is not on Day view

                return Q.fcall(function () {
                    return dayButton.getPattern(10015);
                }).then(function (togglePattern) {

                    togglePattern.toggle();

                    return Q.fcall(function () {
                        return desktop.findFirst(function (el) { return (el.name == "Today"); }, 0, 11);
                    }).then(function (todayButton) {

                        // Just get the pattern. Don't check for Errors. Because Patterns are built in. 
                        // Gonna check this later
                        var todayButtonInvokePat = todayButton.getPattern(10000);

                        // Click on Today Button
                        todayButtonInvokePat.invoke();

                        // Wait for 2 seconds
                        host.setTimeout(function () { inTodayPage(desktop); }, 2000);


                    }, function (error) { throw new Error("Can't find Today button!") });

                }, function (error) { throw new Error("Can't find Toggle pattern!") });

            }, function (error) { throw new Error("Can't find Day button!") });


        }, function (error) { throw new Error("Can't find selection item pattern on HOME button!"); });

    }, function (error) { throw new Error("Can't find HOME button!!"); });

}

host.onkeypress = function (e) {
    console.log("onkeypress");
    console.log(JSON.stringify(e));

    
    // "1"
    // When ctrl + Caps lock + 1 is pressed, we can trigger the script for checking the next meeting
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

                    return calendarButton.getPattern(10000);

                }).then(function (calendarInvoke) {

                    return Q.fcall(function () {

                        // Click on the Calendar tab button
                        calendarInvoke.invoke();

                        // Wait 2 seconds till we jump to the Calendar page
                        host.setTimeout(function () { inCalendarPage(desktop); }, 2000);

                    })
                }, function (error) { throw new Error("Can't get access to the invoke pattern!!"); });

            }, function (error) { throw new Error("Can't access to the calendar tab button!"); });

            }, function (error) { throw new Error("Can't get root value!!"); });
    }
    // "2"
    else if (e.keyCode === 50) {

    }
    // "3"
    else if (e.keyCode === 51) {
    }
    // "4"
    else if (e.keyCode === 52) {
    }
    // "5"
    else if (e.keyCode === 53) {
        debugger;
    }
};
