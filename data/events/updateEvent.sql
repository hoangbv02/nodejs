UPDATE events
set eventTitle=@eventTitle,
eventDescription=@eventDescription,
startDate=@startDate,
endDate=@endDate,
avenue=@avenue,
maxMember=@maxMember

where eventId=@eventId


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
