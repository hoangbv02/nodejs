"use strict";
const config = require("../common/config");
var messageVar = require("../common/messageList");
const userService = require("../services/userService");
var authMethod = require("../common/auth");

exports.isAuth = async (req, res, next) => {
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(401).send(messageVar.ACCESS_TOKEN_REQUIRED);
  }
  const verified = await authMethod.verifyToken(
    accessTokenFromHeader,
    config.ACCESS_TOKEN_SECRET
  );
  if (!verified) {
    return res.status(401).send(messageVar.ACCESS_DEINED_LOGIN);
  }
  var userName = verified.payload.username;
  //var userLogin = await userService.getUserByUserName(userName);
  req.userName = userName;
  return next();
};
