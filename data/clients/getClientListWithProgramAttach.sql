select
    cli.Id,
    cli.Name,
    cli.NameEN,
    cli.ClientTypeId,
    cli.Description,
    cli.DescriptionEN,
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
    ) ProgramJson
from
    Clients cli