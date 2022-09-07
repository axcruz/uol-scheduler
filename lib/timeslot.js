var moment = require("moment");

export function mergeRanges(meetings) {
  // sort by start times, slice will return a shallow copy of the array, not affecting original array
  var sortedMeetings = meetings.slice().sort(function (a, b) {
    return a.startTime > b.startTime ? 1 : -1;
  });

  // initialize mergedMeetings with the earliest meeting
  var mergedMeetings = [sortedMeetings[0]];

  for (var i = 1; i < sortedMeetings.length; i++) {
    var currentMeeting = sortedMeetings[i];
    var lastMergedMeeting = mergedMeetings[mergedMeetings.length - 1];

    // if the current and last meetings overlap, use the latest end time
    // objects, and arrays (which are objects) all are passed by reference. thus change will be recorded.
    if (currentMeeting.startTime <= lastMergedMeeting.endTime) {
      lastMergedMeeting.endTime = moment
        .max(moment(lastMergedMeeting.endTime), moment(currentMeeting.endTime))
        .toDate();

      // add the current meeting since it doesn't overlap
    } else {
      mergedMeetings.push(currentMeeting);
    }
  }

  return mergedMeetings;
}

export function findAvailableTimeSlots(
  startTimeSlot,
  endTimeSlot,
  occupiedTimeSlots,
  eventDurationInMinutes
) {
  var availableTimeslots = [];

  // Generate a list of possible meeting times with specified duration from start to end

  var curTimeSlot = startTimeSlot;

  while (curTimeSlot < endTimeSlot) {
    var meetingStartTime = curTimeSlot;
    var meetingEndTime = moment(meetingStartTime)
      .add(eventDurationInMinutes, "m")
      .toDate();

    // If the meeting time overlaps with any on the occupied time slots, remove from the list

    var eligible = true;

    for (var i = 0; i < occupiedTimeSlots.length; i++) {
      var occupiedSlot = occupiedTimeSlots[i];
      if (
        (meetingStartTime >= occupiedSlot.startTime &&
          meetingStartTime <= occupiedSlot.endTime) ||
        (meetingEndTime >= occupiedSlot.startTime &&
          meetingEndTime <= occupiedSlot.endTime)
      ) {
        eligible = false;
      }
    }

    if (eligible) {
      availableTimeslots.push({
        startTime: meetingStartTime,
        endTime: meetingEndTime,
      });
    }

    curTimeSlot = meetingEndTime;
  }

  // Return the resulting list as the list of available timeslots
  return availableTimeslots;
}
