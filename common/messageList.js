"use strict";
var SUCCESS_MESSAGE = "Success";
var DELETE_SUCCESS_MESSAGE = "Delete Success";
var UPDATE_MULTIPLE_SUCCESS_MESSAGE = "Update multiple record Success";
var FAILED_MESSAGE = "Failed";
var ERROR_SUCCESS = 1;
var ERROR_FAILED = 0;
var MESSAGE_EMPTY = "{0} is required";
var MESSAGE_ALL_EXIST = "{0}-{1}-is not exists";
var MESSAGE_ALL_EMPTY = "{0}-{1}-is required";
var MESSAGE_ALL_OVER_LENGTH = "{0}-{1}-Length is over than {2}";
var MESSAGE_ALL_OVER_SIZE = "{0}-{1}-Size is over than {2} {3}";
var MESSAGE_OVER_LENGTH = "{0} is over than {1} characters";
var MESSAGE_OVER_SIZE = "{0} size is over than {1} {2}";
var MESSAGE_EXIST = "{0} {1} is exists";
var MESSAGE_EXIST_USER_NAME =
    "User is not exists.Please input username or password again!";
var MESSAGE_LOGIN_FAILED = "Login failed. Please try again later!";
var MESSAGE_LOGIN_SUCCESS = "Login successfully";
var ACCESS_TOKEN_REQUIRED = "Access token key is required";
var ACCESS_DEINED_LOGIN = "You don't access the screen.Please login again!";
var ACCESS_TOKEN_INVALID = "Access token key is invalid";
var REFRESH_TOKEN_REQUIRED = "Refresh token key is required";
var CREATE_ACCESS_TOKEY_KEY_SUCCESS = "Create access token key success.";
var REFRESH_TOKEN_INVALID = "Refresh token key is invalid";
var CREATE_ACCESS_TOKEY_KEY_FAILED = "Create access token key failed.";

module.exports = {
    SUCCESS_MESSAGE: SUCCESS_MESSAGE,
    DELETE_SUCCESS_MESSAGE: DELETE_SUCCESS_MESSAGE,
    FAILED_MESSAGE: FAILED_MESSAGE,
    ERR_CALL_API_SUCCESS: ERROR_SUCCESS,
    ERR_CALL_API_FAILED: ERROR_FAILED,
    MESSAGE_EMPTY: MESSAGE_EMPTY,
    MESSAGE_ALL_OVER_SIZE: MESSAGE_ALL_OVER_SIZE,
    MESSAGE_ALL_EXIST: MESSAGE_ALL_EXIST,
    MESSAGE_ALL_EMPTY: MESSAGE_ALL_EMPTY,
    MESSAGE_ALL_OVER_LENGTH: MESSAGE_ALL_OVER_LENGTH,
    MESSAGE_OVER_LENGTH: MESSAGE_OVER_LENGTH,
    MESSAGE_OVER_SIZE: MESSAGE_OVER_SIZE,
    MESSAGE_EXIST: MESSAGE_EXIST,
    UPDATE_MULTIPLE_SUCCESS_MESSAGE: UPDATE_MULTIPLE_SUCCESS_MESSAGE,
    MESSAGE_EXIST_USER_NAME: MESSAGE_EXIST_USER_NAME,
    MESSAGE_LOGIN_FAILED: MESSAGE_LOGIN_FAILED,
    MESSAGE_LOGIN_SUCCESS: MESSAGE_LOGIN_SUCCESS,
    ACCESS_TOKEN_REQUIRED: ACCESS_TOKEN_REQUIRED,
    REFRESH_TOKEN_REQUIRED: REFRESH_TOKEN_REQUIRED,
    ACCESS_TOKEN_INVALID: ACCESS_TOKEN_INVALID,
    CREATE_ACCESS_TOKEY_KEY_SUCCESS: CREATE_ACCESS_TOKEY_KEY_SUCCESS,
    REFRESH_TOKEN_INVALID: REFRESH_TOKEN_INVALID,
    CREATE_ACCESS_TOKEY_KEY_FAILED: CREATE_ACCESS_TOKEY_KEY_FAILED,
    ACCESS_DEINED_LOGIN: ACCESS_DEINED_LOGIN,
    ERROR_SUCCESS: ERROR_SUCCESS,
    ERROR_FAILED: ERROR_FAILED,
};
