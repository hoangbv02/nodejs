"use strict";
const dotenv = require("dotenv");
const assert = require("assert");
const log4js = require("log4js");
dotenv.config();

const {
    PORT,
    HOST,
    HOST_URL,
    SQL_USER,
    SQL_PASSWORD,
    SQL_DATABASE,
    SQL_SERVER,
    SQL_ENCRIPT,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE,
    SIZE_RANDOM_TOKEN,
    AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY,
    BUCKETNAME,
} = process.env;

const sqlEncrypt = process.env.SQL_ENCRIPT === "true";
// LOG4J
// https://github.com/log4js-node/log4js-node

const connStr = `mssql://${SQL_USER}:${SQL_PASSWORD}@${SQL_SERVER}/${SQL_DATABASE}?encrypt=true`;

log4js.configure({
    appenders: { logFile: { type: "file", filename: "logs/logFile.log" } },
    categories: { default: { appenders: ["logFile"], level: "info" } },
});

module.exports = {
    LOG4J: log4js,
    ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE: ACCESS_TOKEN_LIFE,
    SIZE_RANDOM_TOKEN: SIZE_RANDOM_TOKEN,
    AWS_S3_ACCESS_KEY_ID: AWS_S3_ACCESS_KEY_ID,
    AWS_S3_SECRET_ACCESS_KEY: AWS_S3_SECRET_ACCESS_KEY,
    BUCKETNAME: BUCKETNAME,
    CONNECT_STRING: connStr,
    port: PORT,
    host: HOST,
    url: HOST_URL,
    CONFIG_CONNECT: {
        server: SQL_SERVER,
        database: SQL_DATABASE,
        user: SQL_USER,
        password: SQL_PASSWORD,
        options: {
            encrypt: false,
            requestTimeout: 300000,
            trustServerCertificate: true,
        },
    },
};
