select
    count(*) as totalRecord
from
    Clients cli
where cli.name like @searchParamFilter

