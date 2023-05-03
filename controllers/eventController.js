"use strict";
const eventData = require("../services/eventService");

const getEvents = async (req, res, next) => {
  try {
    const events = await eventData.getEvents();
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(result);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const events = await eventData.getEventById(eventId);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

var getEventByIdTitle = async (req, res, next) => {
  try {
    var id = req.params.eventId;
    var title = req.params.eventTitle;
    const events = await eventData.getEventByIdAndTitle(id, title);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const addEvent = async (req, res, next) => {
  try {
    var data = req.body;
    const events = await eventData.createEvent(data);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    var data = req.body;
    const update = await eventData.updateEvent(data);
    update.userName = req.userName;
    res.send(update);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const eventsUpdateBatch = async (req, res, next) => {
  try {
    var data = req.body;
    const update = await eventData.eventsUpdateBatch(data);
    update.userName = req.userName;
    res.send(update);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const exeTransaction = async (req, res, next) => {
  try {
    var data = req.body;
    var transacsion = await eventData.exeTransaction(data);
    //transacsion.userName = req.userName;
    res.send(transacsion);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteEventById = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const events = await eventData.deleteEventById(eventId);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const deleteMultipleRecordByArrayId = async (req, res, next) => {
  try {
    const idArray = req.body.idArray;
    const events = await eventData.deleteMultipleRecord(idArray);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const searchByKeySearch = async (req, res, next) => {
  try {
    const keySearch = req.params.keySearch;
    const events = await eventData.searchByKeySearch(keySearch);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
const getEventByPaging = async (req, res, next) => {
  try {
    const pageIndex = req.params.pageIndex;
    const keySearch = req.params.keySearch;
    const sortNameParam = req.params.sortNameParam;
    const sortTypeParam = req.params.sortTypeParam;
    const events = await eventData.getEventByPaging(
      pageIndex,
      keySearch,
      sortNameParam,
      sortTypeParam
    );
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const bulkInsert = async (req, res, next) => {
  try {
    const input = req.body;
    const events = await eventData.bulkInsert(input);
    events.userName = req.userName;
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEventById,
  getEventByIdTitle,
  searchByKeySearch,
  bulkInsert,
  getEventByPaging,
  deleteMultipleRecord: deleteMultipleRecordByArrayId,
  eventsUpdateBatch,
  exeTransaction,
};
