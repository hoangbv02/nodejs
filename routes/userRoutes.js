"use strict";
const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

const {
 createUser,
 loginUser,
 refreshToken
} = userController;

router.post("/createUser", createUser);
router.post("/loginUser", loginUser);
router.post("/refreshToken", refreshToken);


module.exports = {
  routers: router,
};
