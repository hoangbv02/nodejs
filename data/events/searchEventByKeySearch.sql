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
    eventTitle like @eventTitle