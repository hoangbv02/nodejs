"use strict";
const fileData = require("../services/fileService");

const indexUploadFile = async (req, res, next) => {
  try {
    var pathFile = await fileData.indexUploadFile();
    res.sendFile(pathFile);
  } catch (error) {
    res.status(500).send(error);
  }
};

const indexUploadExcelFile = async (req, res, next) => {
  try {
    var pathFile = await fileData.indexUploadExcelFile();
    res.sendFile(pathFile);
  } catch (error) {
    res.status(500).send(error);
  }
};


const uploadExcelFile = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length == 0) {
      return res.status(400).send("No files were uploaded.");
    }
    var pathFile = await fileData.uploadExcelFile(req.files);
    res.send(pathFile);
  } catch (error) {
    res.status(500).send(error);
  }
};


const multipleFile = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }
    var pathFile = await fileData.multipleFile(req.files);
    res.send(pathFile);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  indexUploadFile,
  multipleFile,
  indexUploadExcelFile,
  uploadExcelFile
};
