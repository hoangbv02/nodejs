"use strict";
const utils = require("../common/utils");
const config = require("../common/config");
const sql = require("mssql");
var variable = require("../common/messageList");

// Bulk insert
const bulkInsert = async (eventInserted, gameIdArray) => {
  var connStr = config.CONFIG_CONNECT;
  try {
    sql
      .connect(connStr)
      .then(() => {
        const table = new sql.Table("event_game");
        table.create = true;
        table.columns.add("eventId", sql.Int, {
          nullable: false,
          primary: true,
        });
        table.columns.add("gameId", sql.Int, {
          nullable: false,
          primary: true,
        });

        // add here rows to insert into the table
        for (var i = 0; i <= gameIdArray.length - 1; i++) {
          table.rows.add(eventInserted, gameIdArray[i]);
        }
        const request = new sql.Request();
        request.bulk(table);
        return "";
      })
      .then((data) => {
        
      })
      .catch((err) => {
        
      });
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  bulkInsert,
};
