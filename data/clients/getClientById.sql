select
    cl.Name as Name,
    cl.NameEN as NameEN,
    cl.VerificationField as StatusId,
    (
        select
            md.MasterName as status
        from
            MasterDatas md
        where
            md.Id in (
                select
                    cl.VerificationField
                from
                    Clients cl
            ) for json path
    ) as ListStatus,
    cl.ClientTypeId as ServiceId,
    (
        select
            md.MasterName as service
        from
            MasterDatas md
        where
            md.Id in (
                select
                    cl.ClientTypeId
                from
                    Clients cl
            ) for json path
    ) as ListService,
    cl.Description as Description,
    cl.DescriptionEN as DescriptionEN,
    (
        select
            pg.Name as name,
            pg.StartDate as startDate,
            pg.EndDate as endDate,
            pg.Id as id
        from
            Programs pg
        where
            pg.Id IN (
                select
                    cp.ProgramId
                from
                    ClientPrograms cp
                where
                    cp.ClientId = cl.Id
            ) for json path
    ) Program,
    cl.ExtraField as ListExtraField,
    (
        select
            m.id,
            m.MediaPath as path
        from
            medias m
        where
            m.RelationId = cl.Id for json path
    ) as ListLogo
from
    Clients cl
    inner join ClientPrograms cp on cl.id = cp.ClientId
    inner join Programs pr on pr.id = cp.ProgramId
where
    cl.Id = @clientId
group by
    cl.id,
    cl.Name,
    cl.NameEN,
    cl.VerificationField,
    cl.ClientTypeId,
    cl.Description,
    cl.DescriptionEN,
    cl.ExtraField