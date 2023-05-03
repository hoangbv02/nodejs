"use strict";
const fs = require("fs-extra");
const path = require("path");
var AWS = require("aws-sdk");

const config = require("../common/config");
const fsFile = require("fs");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const s3 = new AWS.S3({
    accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
});

const { join } = require("path");
const constants = require("./constants");
const loadSQLQueries = async (folderName) => {
    const filePath = join(process.cwd(), "data", folderName);
    const files = await fs.readdir(filePath);
    const sqlFiles = await files.filter((f) => f.endsWith(".sql"));
    const queries = {};

    for (var sqlFile of sqlFiles) {
        const query = await fs.readFileSync(join(filePath, sqlFile), {
            encoding: "UTF-8",
        });
        queries[sqlFile.replace(".sql", "")] = query;
    }
    return queries;
};

const isNullOrWhiteSpace = (input) => {
    if (!input) {
        return true;
    }
    var temp = input.trim();
    if (!temp) {
        return true;
    }
    return false;
};

function getStringWithCommaByArray(arrayInput) {
    if (isNullOrEmptyArray(arrayInput)) {
        return constants.EMPTY;
    }
    return arrayInput.join(", ");
}

const isNullOrEmptyArray = (inputArray) => {
    if (!inputArray) {
        return true;
    }
    if (inputArray.length == 0) {
        return true;
    }
    return false;
};

// Gets the file name and extension from the input file name.
const getExtensionFromFileName = (fileNameInput) => {
    var fileNameTemp = path.parse(fileNameInput).name;
    var extension = path.parse(fileNameInput).ext;
    return fileNameTemp.concat("_", getDateStringFormatByDate(), extension);
};

function getFilesizeInMegaBytes(filename) {
    var stats = fsFile.statSync(filename);
    var fileSizeInBytes = stats.size;
    var fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    return fileSizeInMegabytes;
}

// Uploads an image to S3.
const uploadFileToAWSS3 = async (pathFileLocal, fileNameWithExtension) => {
    try {
        const blob = await fsFile.readFileSync(pathFileLocal);
        const uploadedImage = await s3
            .upload({
                Bucket: config.BUCKETNAME,
                Key:
                    "staging/images/training_NodeJS/client" +
                    fileNameWithExtension,
                Body: blob,
            })
            .promise();
        return uploadedImage.Location;
    } catch (error) {
        return error.message;
    }
    return constants.EMPTY;
};

// Generates a random string.
const generateRandomStringByLength = async (length) => {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
    }
    return result;
};

// Returns a string representation of a date
function getDateStringFormatByDate() {
    var date = new Date();

    var result =
        date.getFullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2) +
        ("0" + date.getMilliseconds()).slice(-2);
    return result;
}

// Checks if the input length is greater than the maximum length.
const isOverMaxLength = (input, length) => {
    var temp = input.trim();
    if (temp.length > length) {
        return true;
    }
    return false;
};

const customDateTime = () => {
    var date = new Date();
    var result = `${date.getFullYear()}-${
        date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    return result;
};

module.exports = {
    loadSQLQueries,
    isNullOrWhiteSpace,
    isOverMaxLength,
    isNullOrEmptyArray,
    getStringWithCommaByArray,
    getExtensionFromFileName,
    uploadFileToAWSS3,
    generateRandomStringByLength,
    getFilesizeInMegaBytes: getFilesizeInMegaBytes,
    customDateTime
};
