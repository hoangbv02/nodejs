select
    cli.Name as Name,
	cli.NameEN as NameEN,
	(
        select
            pg.Name
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
    ) as Program,
    md1.MasterName as ClientType,
	cli.Description as Description,
	cli.DescriptionEN as DescriptionEN,
	md2.MasterName as Status,
	(select MediaPath from Medias where RelationId= cli.Id for json path) as Logo,
	cli.ExtraField
from
    Clients cli
	inner join MasterDatas md1 on cli.ClientTypeId= md1.id
	inner join MasterDatas md2 on cli.VerificationField= md2.id
	inner join ClientPrograms cp on cli.Id = cp.ClientId
WHERE (@SearchParam='' and  cli.name=cli.name) 
OR (@SearchParam is not null and @SearchParam!='' and 
(cli.name like @searchParamFilter ))
group by cli.Id, cli.Name, cli.NameEN, md1.MasterName, cli.Description,
cli.DescriptionEN, md2.MasterName, cli.ExtraField
ORDER BY 
		CASE  WHEN @sortNameParam ='Name' AND @sortTypeParam = 'Ascending'  THEN cli.name
		END ASC,
		CASE  WHEN @sortNameParam ='Name' AND @sortTypeParam = 'Descending'  THEN cli.name
		END DESC
