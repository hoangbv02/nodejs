select
    eventId,
    eventTitle,
    eventDescription,
    startDate,
    endDate,
    avenue,
    maxMember
from
    events
where
    eventId = @eventId