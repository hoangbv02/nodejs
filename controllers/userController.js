"use strict";
const eventData = require("../services/userService");

const createUser = async (req, res, next) => {
  try {
    var data = req.body;
    const events = await eventData.createUser(data);
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const loginUser = async (req, res, next) => {
  try {
    var data = req.body;
    const events = await eventData.loginUser(data);
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const accessTokenFromHeader = req.headers.x_authorization;
    const refreshTokenFromBody = req.body.refreshToken;
    const events = await eventData.refreshToken(accessTokenFromHeader,refreshTokenFromBody);
    res.send(events);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  createUser,
  loginUser,
  refreshToken,
};
