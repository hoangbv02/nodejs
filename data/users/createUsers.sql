INSERT INTO user_test
VALUES
    (
        @userName,
        @password,
        NULL
    )
select
    SCOPE_IDENTITY() AS userId