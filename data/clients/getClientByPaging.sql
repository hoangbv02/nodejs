select
    cli.Id as Id,
    cli.Name as Name,
	(
        select
            pg.Id,
            pg.Name,
            pg.NameEN
        from
            Programs pg
        where
            pg.Id IN (
                select
                    cp.ProgramId
                from
                    ClientPrograms cp
                where
                    cp.ClientId = cli.Id
            ) FOR JSON PATH
    ) Program,
    md1.MasterName as ClientType,
	md2.MasterName as Status
from
    Clients cli
	inner join MasterDatas md1 on cli.ClientTypeId= md1.id
	inner join MasterDatas md2 on cli.VerificationField= md2.id
	inner join ClientPrograms cp on cli.Id = cp.ClientId
WHERE (@SearchParam='' and  cli.name=cli.name) 
OR (@SearchParam is not null and @SearchParam!='' and 
(cli.name like @searchParamFilter ))
group by cli.Id, cli.Name, md1.MasterName, md2.MasterName
ORDER BY 
		CASE  WHEN @sortNameParam ='Name' AND @sortTypeParam = 'Ascending'  THEN cli.name
		END ASC,
		CASE  WHEN @sortNameParam ='Name' AND @sortTypeParam = 'Descending'  THEN cli.name
		END DESC
OFFSET (@pageIndex -1) * @pageSize ROWS FETCH NEXT @pageSize ROWS ONLY
