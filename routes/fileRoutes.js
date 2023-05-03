"use strict";
const express = require("express");
const fileController = require("../controllers/fileController");
const router = express.Router();
const authMiddleware = require("../common/middlewaresLogin");
const isAuth = authMiddleware.isAuth;


const { indexUploadFile,multipleFile,indexUploadExcelFile,uploadExcelFile } = fileController;
router.get("/indexUploadFile", indexUploadFile);
router.post("/multipleFile", multipleFile);

router.get("/indexUploadExcelFile", indexUploadExcelFile);
router.post("/uploadExcelFile", uploadExcelFile);

module.exports = {
  routerFile: router,
};
