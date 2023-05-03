select
    eventId as Id,
    eventTitle as Title,
    eventDescription as Description,
    startDate as StartDate,
    endDate as EndDate,
    avenue as Avenue,
    maxMember as MaxNumber
from
    events e
    WHERE (@SearchParam='' and  e.eventTitle=e.eventTitle)
    OR (@SearchParam is not null and @SearchParam!='' and (e.eventTitle like @SearchParamFilter OR e.eventDescription like @SearchParamFilter ))

ORDER BY 
		CASE  WHEN @SortNameParam ='Title' AND @SortTypeParam = 'Ascending'  THEN e.eventTitle
		END ASC,
		CASE  WHEN @SortNameParam ='Title' AND @SortTypeParam = 'Descending'  THEN e.eventTitle
		END DESC,
		CASE  WHEN @SortNameParam ='Description' AND @SortTypeParam = 'Ascending'  THEN e.eventDescription
		END ASC,
		CASE  WHEN @SortNameParam ='Description' AND @SortTypeParam = 'Descending'  THEN e.eventDescription
		END DESC,
		CASE  WHEN @SortNameParam ='' OR @SortNameParam IS NULL  THEN e.eventId
		END DESC
    
OFFSET (@pageIndex -1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY