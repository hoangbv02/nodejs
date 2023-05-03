"use strict";
const utils = require("../common/utils");
const config = require("../common/config");
const sql = require("mssql");
var variable = require("../common/messageList");
var constant = require("../common/constants");
const eventGame = require("../services/eventGame");
const EventResultSearchModel = require("../models/EventResultSearch.js");
var latinize = require("latinize");
var sequelizeInput = require("sequelize");

String.format = function () {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
};

// Get All Event
const getEvents = async () => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    var logger = config.LOG4J.getLogger("logFile");
    logger.info("Begin getEvents");
    const sqlQueries = await utils.loadSQLQueries("events");
    const list = await pool.request().query(sqlQueries.eventList);
    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: list.recordset,
      message: variable.SUCCESS_MESSAGE,
    };

    logger.info("End getEvents.");
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    logger.error(error.message);
    return result;
  }
};

// Get event by Id
const getEventById = async (eventId) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");
    const oneEvent = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query(sqlQueries.eventById);
    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: oneEvent.recordset,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};
// Search by key
const searchByKeySearch = async (keySearch) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");
    var resultSearchArray = [];

    // remove vietnamese character
    keySearch = latinize(keySearch);

    // search query DB
    var inputData = "%" + keySearch + "%";
    const oneEvent = await pool
      .request()
      .input("eventTitle", sql.NVarChar(50), inputData)
      .query(sqlQueries.searchEventByKeySearch);

    // Get data output
    oneEvent.recordset.forEach((element) => {
      var resultElement = new EventResultSearchModel(
        element.eventTitle,
        element.eventDescription
      );
      resultSearchArray.push(resultElement);
    });

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: resultSearchArray,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// Count event by Title
const countEventByTitle = async (eventTitle, pool) => {
  try {
    const sqlQueries = await utils.loadSQLQueries("events");
    const oneEvent = await pool
      .request()
      .input("eventTitle", sql.NVarChar(50), eventTitle)
      .query(sqlQueries.countEventByTitle);

    return oneEvent.recordset;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// Paging event
const countEventByPaging = async (
  pageIndex,
  pageSize,
  pool,
  searchParam,
  searchParamFilter
) => {
  try {
    const sqlQueries = await utils.loadSQLQueries("events");
    const countRecord = await pool
      .request()
      .input("pageIndex", sql.Int, pageIndex)
      .input("pageSize", sql.Int, pageSize)
      .input("SearchParam", sql.NVarChar, searchParam)
      .input("SearchParamFilter", sql.NVarChar, searchParamFilter)
      .query(sqlQueries.countEventPagingBySearchCondition);

    return countRecord.recordset[0].totalRecord;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

const getEventByPaging = async (
  pageIndex,
  keySearch,
  sortNameParam,
  sortTypeParam
) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    var keySearchParam = latinize(keySearch);
    var searchParamFilter = "%" + keySearchParam + "%";
    var searchparam = utils.isNullOrWhiteSpace(keySearch)
      ? constant.EMPTY
      : keySearch.trim();
    var sortName = utils.isNullOrWhiteSpace(sortNameParam)
      ? constant.EMPTY
      : sortNameParam.trim();

    const sqlQueries = await utils.loadSQLQueries("events");
    var pageSize = constant.PAGE_SIZE;
    const eventList = await pool
      .request()
      .input("pageIndex", sql.Int, pageIndex)
      .input("pageSize", sql.Int, pageSize)
      .input("SearchParam", sql.NVarChar, searchparam)
      .input("SearchParamFilter", sql.NVarChar, searchParamFilter)
      .input("SortNameParam", sql.NVarChar, sortName)
      .input("SortTypeParam", sql.NVarChar, sortTypeParam)
      .query(sqlQueries.getDataEventByPaging);

    var totalRecord = await countEventByPaging(
      pageIndex,
      pageSize,
      pool,
      searchparam,
      searchParamFilter
    );

    var totalPage =
      totalRecord < pageSize ? 0 : Math.ceil(totalRecord / pageSize);

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: eventList.recordset,
      pageIndex: pageIndex,
      totalRecord: totalRecord,
      totalPage: totalPage,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// Get event by Id and title
const getEventByIdAndTitle = async (eventId, eventTitle) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");
    const oneEvent = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .input("eventTitle", sql.NVarChar(50), eventTitle)
      .query(sqlQueries.eventByIdTitle);
    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: oneEvent.recordset,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// Insert event
const createEvent = async (eventData) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");

    // Begin validate
    var errMessage = [];
    if (utils.isNullOrWhiteSpace(eventData.eventTitle)) {
      errMessage.push(String.format(variable.MESSAGE_EMPTY, "Title"));
    } else {
      if (utils.isOverMaxLength(eventData.eventTitle, 50)) {
        errMessage.push(
          String.format(variable.MESSAGE_OVER_LENGTH, "Title", 50)
        );
      } else {
        var countEvent = await countEventByTitle(eventData.eventTitle, pool);
        if (countEvent && countEvent[0].countEvent > 0) {
          errMessage.push(
            String.format(variable.MESSAGE_EXIST, "Title", eventData.eventTitle)
          );
        }
      }
    }
    if (
      !utils.isNullOrWhiteSpace(eventData.eventDescription) &&
      utils.isOverMaxLength(eventData.eventDescription, 10)
    ) {
      errMessage.push(
        String.format(variable.MESSAGE_OVER_LENGTH, "Description", 500)
      );
    }

    if (utils.isNullOrWhiteSpace(eventData.avenue)) {
      errMessage.push(String.format(variable.MESSAGE_EMPTY, "avenue"));
    } else {
      if (utils.isOverMaxLength(eventData.avenue, 50)) {
        errMessage.push(
          String.format(variable.MESSAGE_OVER_LENGTH, "avenue", 50)
        );
      }
    }
    // End validate

    if (errMessage.length > 0) {
      var result = {
        error: variable.ERR_CALL_API_SUCCESS,
        data: null,
        message: errMessage,
      };
      return result;
    }

    var eventInserted = await insertEvent(eventData, pool, sql, sqlQueries);
    var message = await eventGame.bulkInsert(
      eventInserted,
      eventData.arrayGameId
    );

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: null,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  } finally {
    pool.release();
    console.log("insert flow ok");
  }
};

// Insert data
const insertEvent = async (eventData, pool, sql, sqlQueries) => {
  const objEvent = await pool
    .request()
    .input("eventTitle", sql.NVarChar(50), eventData.eventTitle)
    .input("eventDescription", sql.NVarChar(500), eventData.eventDescription)
    .input("startDate", sql.DateTime, eventData.startDate)
    .input("endDate", sql.DateTime, eventData.endDate)
    .input("avenue", sql.NVarChar(50), eventData.avenue)
    .input("maxMember", sql.Int, eventData.maxMember)
    .query(sqlQueries.createEvent);
  return objEvent.recordset[0].eventId;
};

// Bulk insert
const bulkInsert = async (eventDataArray) => {
  try {
    if (utils.isNullOrEmptyArray(eventDataArray)) {
      return 0;
    }
    var connStr = config.CONFIG_CONNECT;

    await sql.connect(connStr);
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");

    const table = new sql.Table("events");
    table.create = true;
    table.columns.add("eventTitle", sql.NVarChar(50), {
      nullable: true,
      primary: false,
    });
    table.columns.add("eventDescription", sql.NVarChar(500), {
      nullable: true,
      primary: false,
    });
    table.columns.add("startDate", sql.DateTime, {
      nullable: true,
      primary: false,
    });
    table.columns.add("endDate", sql.DateTime, {
      nullable: true,
      primary: false,
    });
    table.columns.add("avenue", sql.NVarChar(50), {
      nullable: true,
      primary: false,
    });
    table.columns.add("maxMember", sql.Int, {
      nullable: true,
      primary: false,
    });

    // add here rows to insert into the table
    for (var i = 0; i <= eventDataArray.length - 1; i++) {
      table.rows.add(
        eventDataArray[i].eventTitle,
        eventDataArray[i].eventDescription,
        eventDataArray[i].startDate,
        eventDataArray[i].endDate,
        eventDataArray[i].avenue,
        eventDataArray[i].maxMember
      );
    }
    const request = new sql.Request();
    request.bulk(table);

    const lastIDInserted = await pool
      .request()
      .query(sqlQueries.getLastIdInserted);
    var idMax = lastIDInserted.recordset[0].LastIDInserted;
    var lastIDInsertedOutput = 0;
    if (idMax != 1) {
      lastIDInsertedOutput = idMax + 1;
    } else {
      lastIDInsertedOutput = idMax;
    }

    var output = [];
    var index = lastIDInsertedOutput;
    eventDataArray.forEach((element) => {
      output.push(index);
      index++;
    });

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: output,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};
// Update multiple record
const eventsUpdateBatch = async (values) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const statements = [];
    const tableName = "events";
    const sqlQueries = await utils.loadSQLQueries("events");

    for (let i = 0; i < values.length; i++) {
      statements.push(
        pool.request().query(
          `UPDATE ${tableName} 
          SET eventTitle='${values[i].eventTitle}' 
          WHERE eventId=${values[i].eventId};`
        )
      );
    }
    const resultUpdate = await Promise.all(statements);

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: null,
      message: variable.UPDATE_MULTIPLE_SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// begin transaction
const exeTransaction = async (eventData) => {
  const pool = new sql.ConnectionPool(config.CONFIG_CONNECT);
  var logger = config.LOG4J.getLogger("logFile");
  logger.info("Begin exeTransaction.");
  await pool.connect().then(async function () {
    const transaction = new sql.Transaction(pool);
    await transaction.begin(async (err) => {
      let rolledBack = false;
      transaction.on("rollback", (aborted) => {
        rolledBack = true;
      });
      var request = new sql.Request(transaction);
      let queryStatement = `INSERT INTO events VALUES ('${eventData.eventTitle}','${eventData.eventDescription}',
      '${eventData.startDate}','${eventData.endDate}','${eventData.avenue}','${eventData.maxMember}')`;
      let queryStatementGames = `INSERT INTO games VALUES ('${eventData.eventTitle}','${eventData.eventDescription}')`;
      try {
        await request.query(queryStatement);
        await request.query(queryStatementGames);
        transaction.commit((err) => {});
        logger.info("End exeTransaction.");
      } catch (err) {
        transaction.rollback((err) => {});
        logger.error(err.message);
      } finally {
        pool.close();
      }
    });
  });

  var result = {
    error: variable.ERR_CALL_API_SUCCESS,
    data: null,
    message: variable.SUCCESS_MESSAGE,
  };
  return result;
};

// end transaction

// Update event
const updateEvent = async (eventData) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");
    const objEvent = await pool
      .request()
      .input("eventId", sql.Int, eventData.eventId)
      .input("eventTitle", sql.NVarChar(50), eventData.eventTitle)
      .input("eventDescription", sql.NVarChar(500), eventData.eventDescription)
      .input("startDate", sql.DateTime, eventData.startDate)
      .input("endDate", sql.DateTime, eventData.endDate)
      .input("avenue", sql.NVarChar(50), eventData.avenue)
      .input("maxMember", sql.Int, eventData.maxMember)
      .query(sqlQueries.updateEvent);
    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: objEvent.recordset,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// Delete event by Id
const deleteEventById = async (eventId) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("events");
    const deleted = await pool
      .request()
      .input("eventId", sql.Int, eventId)
      .query(sqlQueries.deleteEvent);
    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: deleted.recordset,
      message: variable.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};
const deleteMultipleRecord = async (idArray) => {
  try {
    let queryStatement = `DELETE FROM events WHERE eventId IN (${idArray})`;
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const deleted = await pool.request().query(queryStatement);
    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: deleted.recordset,
      message: variable.DELETE_SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: variable.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEventById,
  getEventByIdAndTitle,
  searchByKeySearch,
  bulkInsert,
  getEventByPaging,
  deleteMultipleRecord,
  eventsUpdateBatch,
  exeTransaction,
};
