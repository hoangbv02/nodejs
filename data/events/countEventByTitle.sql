select
    COUNT(eventId) as countEvent
from
    events
where
    eventTitle = @eventTitle