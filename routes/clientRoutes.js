"use strict";
const express = require("express");
const clientController = require("../controllers/clientController");
const router = express.Router();
const authMiddleware = require("../common/middlewaresLogin");
const isAuth = authMiddleware.isAuth;
const path = require("path");

const {
    getClientInnerJoin,
    getClientListWithProgramAttach,
    getClientByPaging,
    createClient,
    updateClient,
    getClientById,
    importFileClient,
    exportFileClient,
} = clientController;
router.get("/clients", isAuth, getClientInnerJoin);
router.get("/clients/:clientId", isAuth, getClientById);
router.get(
    "/clientPaging/:pageIndex/:searchParam/:sortNameParam/:sortTypeParam",
    isAuth,
    getClientByPaging
);
router.post("/clients/importFile", isAuth, importFileClient);
router.post("/clients/exportFile", isAuth, exportFileClient);
router.post("/clients", isAuth, createClient);
router.put("/clients/:clientId", isAuth, updateClient);
router.get(
    "/clientListWithProgramAttach",
    isAuth,
    getClientListWithProgramAttach
);

module.exports = {
    routeClients: router,
};
