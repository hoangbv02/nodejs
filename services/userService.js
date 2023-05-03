"use strict";
const utils = require("../common/utils");
const config = require("../common/config");
const sql = require("mssql");
var messageVar = require("../common/messageList");
var bcrypt = require("bcrypt");
var authMethod = require("../common/auth");
var randomToken = require("rand-token");
const constants = require("../common/constants");

// Insert data
const createUser = async (eventData) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("users");
    const hashPassword = bcrypt.hashSync(eventData.password, 10);
    const objUser = await pool
      .request()
      .input("userName", sql.NVarChar(50), eventData.userName)
      .input("password", sql.NVarChar(1000), hashPassword)
      .query(sqlQueries.createUsers);

    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: objUser.recordset[0].userId,
      message: messageVar.SUCCESS_MESSAGE,
    };
    return result;
  } catch (error) {
    var result = {
      error: messageVar.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

// Refresh token when access token key is expired
const refreshToken = async (accessTokenFromHeader, refreshTokenFromBody) => {
  if (utils.isNullOrWhiteSpace(accessTokenFromHeader)) {
    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: null,
      message: messageVar.ACCESS_TOKEN_REQUIRED,
    };
    return result;
  }
  if (utils.isNullOrWhiteSpace(refreshTokenFromBody)) {
    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: null,
      message: messageVar.REFRESH_TOKEN_REQUIRED,
    };
    return result;
  }
  // Decode access token key
  const decoded = await authMethod.decodeToken(
    accessTokenFromHeader,
    config.ACCESS_TOKEN_SECRET
  );
  if (!decoded) {
    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: null,
      message: messageVar.ACCESS_TOKEN_INVALID,
    };
    return result;
  }
  // Check username exist
  const username = decoded.payload.username;
  var objUser = await getUserByUserName(username);
  if (objUser == null) {
    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: null,
      message: messageVar.MESSAGE_EXIST_USER_NAME,
    };
    return result;
  }
  var refreshTokenDB = objUser.recordset[0].refreshToken;
  if (refreshTokenFromBody != refreshTokenDB) {
    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: null,
      message: messageVar.REFRESH_TOKEN_INVALID,
    };
    return result;
  }

  // Begin create new access tokey key
  const dataForAccessToken = {
    username,
  };

  const accessTokenLife = config.ACCESS_TOKEN_LIFE;
  const accessTokenSecret = config.ACCESS_TOKEN_SECRET;
  const accessToken = await authMethod.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: null,
      message: messageVar.CREATE_ACCESS_TOKEY_KEY_FAILED,
    };
    return result;
  }
  var result = {
    error: messageVar.ERR_CALL_API_SUCCESS,
    data: {
      accessToken: accessToken,
      username: username,
    },
    message: messageVar.CREATE_ACCESS_TOKEY_KEY_SUCCESS,
  };
  return result;
  // End create new access token key
};

// Update user token
const updateTokenUser = async (eventData) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("users");
    const objUser = await pool
      .request()
      .input("userId", sql.Int, eventData.userId)
      .input("refreshToken", sql.NVarChar(sql.MAX), eventData.refreshToken)
      .query(sqlQueries.updateTokenUser);
    return constants.EMPTY;
  } catch (error) {
    return error.message;
  }
};

const getUserByUserName = async (userName) => {
  try {
    var pool = await sql.connect(config.CONFIG_CONNECT);
    const sqlQueries = await utils.loadSQLQueries("users");
    const objUser = await pool
      .request()
      .input("userName", sql.NVarChar(50), userName)
      .query(sqlQueries.getUserByUserName);
    if (!objUser.recordset[0]) {
      return null;
    }
    return objUser;
  } catch (error) {
    return null;
  }
};

// Login
const loginUser = async (eventData) => {
  try {
    var objUser = await getUserByUserName(eventData.userName);
    if (objUser == null) {
      var result = {
        error: messageVar.ERR_CALL_API_SUCCESS,
        data: null,
        message: messageVar.MESSAGE_EXIST_USER_NAME,
      };
      return result;
    }
    var userNameDB = objUser.recordset[0].userName;
    var passwordDB = objUser.recordset[0].password;
    var userIdDB = objUser.recordset[0].userId;
    var refreshTokenDB = objUser.recordset[0].refreshToken;
    var userOutput = {};
    userOutput.username = userNameDB;
    userOutput.userId = userIdDB;
    const isPasswordValid = bcrypt.compareSync(eventData.password, passwordDB);
    if (!isPasswordValid) {
      var result = {
        error: messageVar.ERR_CALL_API_SUCCESS,
        data: null,
        message: messageVar.MESSAGE_EXIST_USER_NAME,
      };
      return result;
    }
    // Generate access token key
    const accessTokenLife = config.ACCESS_TOKEN_LIFE;
    const accessTokenSecret = config.ACCESS_TOKEN_SECRET;
    const dataForAccessToken = {
      username: userNameDB,
    };
    const accessToken = await authMethod.generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife
    );
    if (!accessToken) {
      var result = {
        error: messageVar.ERR_CALL_API_SUCCESS,
        data: null,
        message: messageVar.MESSAGE_LOGIN_FAILED,
      };
      return result;
    }
    // Generate refresh token key
    let refreshToken = randomToken.generate(config.SIZE_RANDOM_TOKEN);
    if (utils.isNullOrWhiteSpace(refreshTokenDB)) {
      var objToken = {};
      objToken.userId = userIdDB;
      objToken.refreshToken = refreshToken;
      var message = await updateTokenUser(objToken);
      if (!utils.isNullOrWhiteSpace(message)) {
        var result = {
          error: messageVar.ERR_CALL_API_FAILED,
          message: message,
        };
        return result;
      }
    } else {
      refreshToken = refreshTokenDB;
    }

    var result = {
      error: messageVar.ERR_CALL_API_SUCCESS,
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: userOutput,
      },
      message: messageVar.MESSAGE_LOGIN_SUCCESS,
    };
    return result;
  } catch (error) {
    var result = {
      error: messageVar.ERR_CALL_API_FAILED,
      message: error.message,
    };
    return result;
  }
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  getUserByUserName
};
