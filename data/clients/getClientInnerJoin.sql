select 
cl.Name,
cl.NameEN,

md.MasterName as Status,
cl.Description,
cl.DescriptionEN

from Clients cl LEFT JOIN MasterDatas md
ON cl.VerificationField = md.Id