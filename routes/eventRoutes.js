"use strict";
const express = require("express");
const eventController = require("../controllers/eventController");
const router = express.Router();
const authMiddleware = require("../common/middlewaresLogin");
const isAuth = authMiddleware.isAuth;

const {
  getEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEventById,
  getEventByIdTitle,
  searchByKeySearch,
  bulkInsert,
  getEventByPaging,
  deleteMultipleRecord,
  eventsUpdateBatch,
  exeTransaction,
} = eventController;

//x_authorization with value access tokey key

router.get("/events", isAuth, getEvents);

router.post("/events", isAuth, addEvent);
router.post("/bulkInsertEvent", isAuth, bulkInsert);
//router.post("/exeTransaction", isAuth, exeTransaction);
router.post("/exeTransaction", exeTransaction);

router.put("/events/:eventId", isAuth, updateEvent);
router.put("/eventsUpdateBatch", isAuth, eventsUpdateBatch);

router.delete("/events/:eventId", isAuth, deleteEventById);

router.delete("/eventsDelete", isAuth, deleteMultipleRecord);

router.get("/events/:eventId", isAuth, getEventById);
router.get("/events/:eventId/:eventTitle", isAuth, getEventByIdTitle);

router.get("/eventSearch/:keySearch/", isAuth, searchByKeySearch);

router.get(
  "/eventPaging/:pageIndex/:keySearch/:sortNameParam/:sortTypeParam",
  isAuth,
  getEventByPaging
);

module.exports = {
  routers: router,
};
