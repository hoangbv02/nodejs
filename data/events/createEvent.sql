INSERT INTO events
VALUES
    (
        @eventTitle,
        @eventDescription,
        @startDate,
        @endDate,
        @avenue,
        @maxMember
    )
select
    SCOPE_IDENTITY() AS eventId