"use strict";
const utils = require("../common/utils");
const config = require("../common/config");
const sql = require("mssql");
var variable = require("../common/messageList");
const constants = require("../common/constants");
const path = require("path");
const { dirname } = require("path");
const excelToJson = require("convert-excel-to-json");

// Index
const indexUploadFile = async () => {
  try {
    return path.resolve("./views/uploadFile.html");
  } catch (error) {
    return error.message;
  }
};

const indexUploadExcelFile = async () => {
  try {
    return path.resolve("./views/uploadExcelFile.html");
  } catch (error) {
    return error.message;
  }
};

// Upload file
const multipleFile = async (file) => {
  var logger = config.LOG4J.getLogger("logFile");
  logger.info("Begin upload file");
  const appDir = dirname(require.main.filename);
  try {
    const fileInput = file.sampleFile;
    if (!fileInput.length) {
      var newFile = utils.getExtensionFromFileName(fileInput.name);
      const savePath = path.join(appDir, "uploads", newFile);
      if (fileInput.truncated) {
        var result = {
          error: variable.ERR_CALL_API_SUCCESS,
          data: null,
          message: "File size is over than 1024KB",
        };
        logger.info("End upload file");
        return result;
      }

      // Upload file to server folder
      await fileInput.mv(savePath);

      // Upload file to AWS S3
      var message = await utils.uploadFileToAWSS3(savePath, newFile);

      var result = {
        error: variable.ERR_CALL_API_SUCCESS,
        data: message,
        message: variable.SUCCESS_MESSAGE,
      };
      logger.info("End upload file");
      return result;
    }

    let promises = [];
    var errorMessage = [];
    // Validate
    fileInput.forEach((element) => {
      if (element.truncated) {
        errorMessage.push("File size is over than max size");
      }
    });
    if (errorMessage.length > 0) {
      var result = {
        error: variable.ERR_CALL_API_SUCCESS,
        data: null,
        message: "File size is over than max size",
      };
      logger.info("End upload file");
      return result;
    }

    fileInput.forEach((element) => {
      const savePath = path.join(
        appDir,
        "uploads",
        utils.getExtensionFromFileName(element.name)
      );
      promises.push(element.mv(savePath));
    });
    await Promise.all(promises);

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: null,
      message: variable.SUCCESS_MESSAGE,
    };
    logger.info("End upload file");
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

const uploadExcelFile = async (file) => {
  var logger = config.LOG4J.getLogger("logFile");
  logger.info("Begin upload file");
  const appDir = dirname(require.main.filename);
  try {
    const fileInput = file.sampleFile1;
    if (!fileInput.length) {
      var newFile = utils.getExtensionFromFileName(fileInput.name);
      const savePath = path.join(appDir, "uploads", newFile);

      // Upload file to server folder
      await fileInput.mv(savePath);

      // Check file size
      var fileSizeByte = utils.getFilesizeInMegaBytes(savePath);
      if (fileSizeByte > 10) {
        var result = {
          error: variable.ERR_CALL_API_SUCCESS,
          data: null,
          message: "File size is over than 10MB",
        };
        return result;
      }

      // Read data from excel file
      const resultData = excelToJson({
        sourceFile: savePath,
        header: {
          rows: 1,
        },
        columnToKey: {
          "*": "{{columnHeader}}"
        },
      });

      // // Upload file to AWS S3
      // var message = await utils.uploadFileToAWSS3(savePath, newFile);

      var result = {
        error: variable.ERR_CALL_API_SUCCESS,
        data: resultData,
        message: variable.SUCCESS_MESSAGE,
      };
      logger.info("End upload file");
      return result;
    }

    var result = {
      error: variable.ERR_CALL_API_SUCCESS,
      data: null,
      message: variable.SUCCESS_MESSAGE,
    };
    logger.info("End upload file");
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

module.exports = {
  indexUploadFile,
  multipleFile,
  indexUploadExcelFile,
  uploadExcelFile,
};
