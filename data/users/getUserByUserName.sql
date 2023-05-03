select
    top 1 userId,
    userName,
    password,
    refreshToken
from
    user_test
where
    userName = @userName