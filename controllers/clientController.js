"use strict";
const clientData = require("../services/clientService");
const constants = require("../common/constants");

const getClientInnerJoin = async (req, res, next) => {
    try {
        const clients = await clientData.getClientWithJoin();
        res.send(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getClientListWithProgramAttach = async (req, res, next) => {
    try {
        const clients = await clientData.getClientListWithProgramAttach();
        res.send(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getClientByPaging = async (req, res, next) => {
    try {
        const pageIndex = +req.params.pageIndex;
        const searchParam = req.params.searchParam;
        const sortNameParam = req.params.sortNameParam;
        const sortTypeParam = req.params.sortTypeParam;
        const pageSize = constants.PAGE_SIZE;
        const clients = await clientData.getClientByPaging(
            pageIndex,
            pageSize,
            searchParam,
            sortNameParam,
            sortTypeParam
        );
        res.send(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const createClient = async (req, res, next) => {
    try {
        const data = await req.body;
        const files = req.files;
        const userName = req.userName;
        const client = await clientData.createClient(data, files, userName);
        res.send(client);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const updateClient = async (req, res, next) => {
    try {
        const data = await req.body;
        const files = req.files;
        const clientId = req.params.clientId;
        const userName = req.userName;
        const client = await clientData.updateClient(
            data,
            files,
            userName,
            clientId
        );
        res.send(client);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getClientById = async (req, res, next) => {
    try {
        const clientId = req.params.clientId;
        const client = await clientData.getClientById(clientId);
        res.send(client);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const importFileClient = async (req, res, next) => {
    try {
        const file = req.files;
        const userName = req.userName;
        const clients = await clientData.importFileClient(file, userName);
        res.send(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const exportFileClient = async (req, res, next) => {
    try {
        const clients = await clientData.exportFileClient();
        res.attachment("clients.xlsx");
        res.send(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = {
    getClientInnerJoin,
    getClientListWithProgramAttach,
    getClientByPaging,
    createClient,
    updateClient,
    getClientById,
    importFileClient,
    exportFileClient,
};
