select
    COUNT(*) as totalRecord
from
    events e

    WHERE (@SearchParam='' and  e.eventTitle=e.eventTitle)
    OR (@SearchParam is not null and @SearchParam!='' and (e.eventTitle like @SearchParamFilter OR e.eventDescription like @SearchParamFilter ))

