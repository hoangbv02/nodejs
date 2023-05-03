"use strict";
const sql = require("mssql");
const latinize = require("latinize");
const excelToJson = require("convert-excel-to-json");
const randomToken = require("rand-token");
const excel = require("node-excel-export");
const fs = require("fs");
const config = require("../common/config");
const utils = require("../common/utils");
const { dirname, join } = require("path");
var variable = require("../common/messageList");
const constants = require("../common/constants");
const { getUserByUserName } = require("./userService");
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require("node-localstorage").LocalStorage;
    global.localStorage = new LocalStorage("common/scratch");
}

// Get All Client
const getClientWithJoin = async () => {
    try {
        var pool = await sql.connect(config.sql);
        const sqlQueries = await utils.loadSQLQueries("clients");
        const list = await pool.request().query(sqlQueries.getClientInnerJoin);
        var result = {
            error: variable.ERROR_SUCCESS,
            data: list.recordset,
            message: variable.SUCCESS_MESSAGE,
        };
        return result;
    } catch (error) {
        var result = {
            error: variable.ERROR_FAILED,
            message: error.message,
        };
        return result;
    }
};

// Get Client with program list
const getClientListWithProgramAttach = async () => {
    try {
        var pool = await sql.connect(config.sql);
        const sqlQueries = await utils.loadSQLQueries("clients");
        const list = await pool
            .request()
            .query(sqlQueries.getClientListWithProgramAttach);
        var resultArray = [];
        // Gia tri NULL thi thuoc tinh do ko xuat hien o ket qua khi dung Json.parse
        list.recordset.forEach((element) => {
            var jsonObj = JSON.parse(element.ProgramJson);
            var arrayName = [];
            if (jsonObj) {
                jsonObj.forEach((element) => {
                    arrayName.push(element.Name);
                });
            }
            resultArray.push({
                Id: element.Id,
                Name: element.Name,
                ProgramNameDisp: utils.getStringWithCommaByArray(arrayName),
                Program: jsonObj,
            });
        });

        var result = {
            error: variable.ERROR_SUCCESS,
            data: resultArray,
            message: variable.SUCCESS_MESSAGE,
        };
        return result;
    } catch (error) {
        var result = {
            error: variable.ERROR_FAILED,
            message: error.message,
        };
        return result;
    }
};
// Returns the number of clients paging by search
const countClientPagingBySearch = async (searchParamFilter) => {
    try {
        var pool = await sql.connect(config.CONFIG_CONNECT);
        var sqlQueries = await utils.loadSQLQueries("clients");
        var totalRecord = await pool
            .request()
            .input("searchParamFilter", sql.NVarChar, searchParamFilter)
            .query(sqlQueries.countClientPagingBySearch);
        return totalRecord.recordset[0].totalRecord;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};
// Get a list of clients for a given search.
const getClientByPaging = async (
    pageIndex,
    pageSize,
    searchParam,
    sortNameParam,
    sortTypeParam
) => {
    try {
        var pool = await sql.connect(config.CONFIG_CONNECT);
        var keySearchParam = latinize(searchParam);
        var searchParamFilter = `%${keySearchParam}%`;
        var search = utils.isNullOrWhiteSpace(searchParam)
            ? constants.EMPTY
            : searchParam.trim();
        var sortName = utils.isNullOrWhiteSpace(sortNameParam)
            ? constants.EMPTY
            : sortNameParam.trim();
        var sortType = utils.isNullOrWhiteSpace(sortTypeParam)
            ? constants.EMPTY
            : sortTypeParam.trim();
        const paramObj = {
            searchParam: search,
            searchParamFilter,
            sortNameParam: sortName,
            sortTypeParam: sortType,
        };
        localStorage.setItem("paramObj", JSON.stringify(paramObj));
        var sqlQueries = await utils.loadSQLQueries("clients");
        var list = await pool
            .request()
            .input("searchParamFilter", sql.NVarChar, searchParamFilter)
            .input("searchParam", sql.NVarChar, search)
            .input("pageIndex", sql.Int, pageIndex)
            .input("pageSize", sql.Int, pageSize)
            .input("sortNameParam", sql.NVarChar, sortName)
            .input("sortTypeParam", sql.NVarChar, sortType)
            .query(sqlQueries.getClientByPaging);
        var resultArray = [];
        list.recordset.forEach((item) => {
            var objJson = JSON.parse(item.Program);
            resultArray.push({
                id: item.Id,
                name: item.Name,
                program: objJson,
                clientType: item.ClientType,
                status: item.Status,
            });
        });
        var totalRecord = await countClientPagingBySearch(searchParamFilter);
        var totalPage =
            totalRecord < pageSize ? 0 : Math.ceil(totalRecord / pageSize);
        var result = {
            error: variable.ERR_CALL_API_SUCCESS,
            data: resultArray,
            totalRecord: totalRecord,
            pageSize: pageSize,
            pageIndex: pageIndex,
            totalPage: totalPage,
            message: variable.SUCCESS_MESSAGE,
        };
        return result;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};
// Creates a client.
const createClient = async (clientData, file, userName) => {
    try {
        // Validate client data.
        var validated = validateClient(clientData, file);
        if (validated) {
            return validated;
        }
        // Get a user by name.
        var userObj = await getUserByUserName(userName);
        var userId = userObj != null && userObj.recordset[0].userId.toString();
        // Inserts a new file into the database.
        var insertedTransaction = await exeTransactionInsert(
            clientData,
            file,
            userId
        );

        var result = {
            error: variable.ERR_CALL_API_SUCCESS,
            data: null,
            message: variable.SUCCESS_MESSAGE,
        };
        return result;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    }
};

// Updates the recordset of the user.
const updateClient = async (clientData, file, userName, clientId) => {
    try {
        var validated = validateClient(clientData, file);
        if (validated) {
            return validated;
        }
        var userObj = await getUserByUserName(userName);
        var userId = userObj.recordset[0].userId.toString();

        var updatedTransaction = await exeTransactionUpdate(
            clientData,
            file,
            userId,
            clientId
        );

        var result = {
            error: variable.ERR_CALL_API_SUCCESS,
            data: null,
            message: variable.SUCCESS_MESSAGE,
        };
        return result;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    }
};

// Get a client.
const getClientById = async (clientId) => {
    try {
        var pool = await sql.connect(config.CONFIG_CONNECT);
        var sqlQueries = await utils.loadSQLQueries("clients");
        const client = await pool
            .request()
            .input("clientId", sql.VarChar(10), clientId)
            .query(sqlQueries.getClientById);
        var resultArray = [];
        if (!utils.isNullOrEmptyArray(client.recordset)) {
            var listStatus = JSON.parse(client.recordset[0].ListStatus);
            var listService = JSON.parse(client.recordset[0].ListService);
            var program = JSON.parse(client.recordset[0].Program);
            var listExtraField = JSON.parse(client.recordset[0].ListExtraField);
            var listLogo = JSON.parse(client.recordset[0].ListLogo);
            resultArray.push({
                name: client.recordset[0].Name,
                nameEN: client.recordset[0].NameEN,
                statusId: client.recordset[0].StatusId,
                listStatus,
                serviceId: client.recordset[0].ServiceId,
                listService,
                description: client.recordset[0].Description,
                descriptionEN: client.recordset[0].DescriptionEN,
                program,
                listExtraField,
                listLogo,
            });
        }
        var result = {
            error: variable.ERROR_SUCCESS,
            data: resultArray,
            message: variable.SUCCESS_MESSAGE,
        };
        return result;
    } catch (error) {
        var result = {
            error: variable.ERROR_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};

const importFileClient = async (file, userName) => {
    try {
        const appDir = dirname(require.main.filename);
        const fileInput = file.sampleFile;
        if (!fileInput.length) {
            var newFile = utils.getExtensionFromFileName(fileInput.name);
            const savePath = join(appDir, "uploads", newFile);
            // Upload file to server folder
            await fileInput.mv(savePath);
            // Read data from excel file
            const data = excelToJson({
                sourceFile: savePath,
                header: {
                    rows: 1,
                },
                columnToKey: {
                    A: "name",
                    B: "nameEN",
                    C: "programName",
                    D: "clientTypeName",
                    E: "description",
                    F: "descriptionEN",
                    G: "status",
                    H: "logo",
                },
            });
            const dataClient = data.Client;
            var validated = await validateClientImport(dataClient);
            if (validated) {
                if (fs.existsSync(savePath)) {
                    fs.unlinkSync(savePath);
                }
                return validated;
            }
            var userObj = await getUserByUserName(userName);
            var userId = userObj.recordset[0].userId.toString();
            var getDateTime = utils.customDateTime();
            var dataClientArr = [];
            var dataClientProgramArr = [];
            var dataMediaArr = [];
            for (let client of dataClient) {
                var clientId = randomToken.generate(config.SIZE_RANDOM_TOKEN);
                let clientTypeName = await getClientTypeName(
                    client.clientTypeName
                );
                let status = await getStatus(client.status);
                let clientTypeId = clientTypeName.recordset[0].Id;
                let statusId = status.recordset[0].Id;
                dataClientArr.push({
                    id: clientId,
                    name: client.name,
                    nameEN: client.nameEN,
                    clientTypeId: clientTypeId,
                    description: client.description,
                    descriptionEN: client.descriptionEN,
                    statusId: statusId,
                    createdOn: getDateTime,
                    createdBy: userId,
                });
                // Get the dataClientProgram for each program.
                if (!utils.isNullOrWhiteSpace(client.programName)) {
                    let programNameArr = client.programName.split("\r\n");
                    for (let item of programNameArr) {
                        let programResult = await getProgramName(item);
                        let programData = programResult.recordset;
                        for (let program of programData) {
                            dataClientProgramArr.push({
                                clientId: clientId,
                                programId: program.Id,
                            });
                        }
                    }
                }

                if (!utils.isNullOrWhiteSpace(client.logo)) {
                    let logoArr = client.logo.split("\r\n");
                    for (let item of logoArr) {
                        if (fs.existsSync(item)) {
                            const appDir = dirname(require.main.filename);
                            const fileArr = item.split("\\");
                            const fileName = fileArr[fileArr.length - 1];
                            var newFile =
                                utils.getExtensionFromFileName(fileName);
                            const filePath = join(appDir, "uploads", newFile);
                            fs.copyFileSync(item, filePath);
                            var pathAWS = await utils.uploadFileToAWSS3(
                                filePath,
                                newFile
                            );
                            dataMediaArr.push({
                                mediaPath: await pathAWS,
                                mediaHashName: newFile,
                                relationId: clientId,
                                createdOn: getDateTime,
                                createdBy: userId,
                            });
                        }
                    }
                }
            }
            await Promise.all(dataMediaArr);
            await exeTransactionImport(
                dataClientArr,
                dataClientProgramArr,
                dataMediaArr
            );
            var result = {
                error: variable.ERR_CALL_API_SUCCESS,
                data: null,
                message: variable.SUCCESS_MESSAGE,
            };
            return result;
        }
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    }
};

// Returns a dataClient for a given program.
const exportFileClient = async () => {
    try {
        var paramObj = JSON.parse(localStorage.getItem("paramObj"));
        var { searchParam, searchParamFilter, sortNameParam, sortTypeParam } =
            paramObj;
        var pool = await sql.connect(config.CONFIG_CONNECT);
        const sqlQueries = await utils.loadSQLQueries("clients");
        const data = await pool
            .request()
            .input("searchParamFilter", sql.NVarChar, searchParamFilter)
            .input("searchParam", sql.NVarChar, searchParam)
            .input("sortNameParam", sql.NVarChar, sortNameParam)
            .input("sortTypeParam", sql.NVarChar, sortTypeParam)
            .query(sqlQueries.getClientFull);
        var dataClient = [];
        data.recordset.forEach((item) => {
            var programArr = JSON.parse(item.Program);
            var logoArr = JSON.parse(item.Logo);
            var extraFieldArr = JSON.parse(item.ExtraField);
            var strLogo = "";
            var strProgram = "";
            var strExtraField = "";
            if (!utils.isNullOrEmptyArray(programArr)) {
                programArr.forEach((e) => {
                    strProgram += e.Name;
                });
            }
            if (!utils.isNullOrEmptyArray(logoArr)) {
                logoArr.forEach((e) => {
                    strLogo += e.MediaPath;
                });
            }
            if (!utils.isNullOrEmptyArray(extraFieldArr)) {
                extraFieldArr.forEach((e) => {
                    strExtraField += e.Title + " : " + e.Content;
                });
            }
            dataClient.push({
                name: !utils.isNullOrWhiteSpace(item.Name) ? item.Name : "",
                nameEN: !utils.isNullOrWhiteSpace(item.NameEN)
                    ? item.NameEN
                    : "",
                program: !utils.isNullOrWhiteSpace(item.strProgram)
                    ? item.strProgram
                    : "",
                clientType: !utils.isNullOrWhiteSpace(item.ClientType)
                    ? item.ClientType
                    : "",
                description: item.Description,
                descriptionEN: item.DescriptionEN,
                logo: strLogo,
                status: item.Status,
                extraField: strExtraField,
            });
        });

        const styles = {
            headerOrange: {
                fill: {
                    fgColor: {
                        rgb: "FF9900",
                    },
                },
                alignment: {
                    horizontal: "left",
                    vertical: "bottom",
                },
            },
            cellText: {
                alignment: {
                    horizontal: "left",
                    vertical: "bottom",
                    wrapText: true,
                },
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                },
            },
            cellBorder: {
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                },
            },
        };
        const specification = {
            name: {
                displayName: "Name",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 150,
            },
            nameEN: {
                displayName: "NameEN",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 150,
            },
            program: {
                displayName: "Program name",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellText,
                width: 150,
            },
            clientType: {
                displayName: "Client Type name",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 150,
            },
            description: {
                displayName: "Description",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 150,
            },
            descriptionEN: {
                displayName: "DescriptionEN",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 150,
            },
            status: {
                displayName: "Status",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 150,
            },
            logo: {
                displayName: "Logo",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellBorder,
                width: 220,
            },
            extraField: {
                displayName: "Extra Field",
                headerStyle: styles.headerOrange,
                cellStyle: styles.cellText,
                width: 220,
            },
        };
        const clients = excel.buildExport([
            {
                name: "Client",
                specification: specification,
                data: dataClient,
            },
        ]);
        return clients;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};

// Get a program by its name
const getProgramName = async (programName) => {
    try {
        var pool = await sql.connect(config.CONFIG_CONNECT);
        var sqlQueries = await utils.loadSQLQueries("clients");
        const program = await pool
            .request()
            .input("programName", sql.NVarChar, programName)
            .query(sqlQueries.getProgramByName);
        return program;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};
// Get the master data for a client type
const getClientTypeName = async (clientTypeName) => {
    try {
        var pool = await sql.connect(config.CONFIG_CONNECT);
        var sqlQueries = await utils.loadSQLQueries("clients");
        const clientType = await pool
            .request()
            .input("clientTypeName", sql.NVarChar, clientTypeName)
            .query(sqlQueries.getMasterDataByClientTypeName);
        return clientType;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};
const getStatus = async (status) => {
    try {
        var pool = await sql.connect(config.CONFIG_CONNECT);
        var sqlQueries = await utils.loadSQLQueries("clients");
        const clientStatus = await pool
            .request()
            .input("status", sql.NVarChar, status)
            .query(sqlQueries.getMasterDataByStatus);
        return clientStatus;
    } catch (error) {
        var result = {
            error: variable.ERR_CALL_API_FAILED,
            message: error.message,
        };
        return result;
    } finally {
        pool.close();
    }
};
const validateClientImport = async (dataClient) => {
    var errMessage = [];
    for (let i = 0; i < dataClient.length; i++) {
        let line = i + 2;
        if (utils.isNullOrWhiteSpace(dataClient[i].name)) {
            errMessage.push(
                String.format(variable.MESSAGE_ALL_EMPTY, line, "Name")
            );
        }
        if (
            !utils.isNullOrWhiteSpace(dataClient[i].name) &&
            utils.isOverMaxLength(dataClient[i].name, 150)
        ) {
            errMessage.push(
                String.format(
                    variable.MESSAGE_ALL_OVER_LENGTH,
                    line,
                    "Name",
                    150
                )
            );
        }
        if (
            !utils.isNullOrWhiteSpace(dataClient[i].nameEN) &&
            utils.isOverMaxLength(dataClient[i].nameEN, 4000)
        ) {
            errMessage.push(
                String.format(
                    variable.MESSAGE_ALL_OVER_LENGTH,
                    line,
                    "NameEN",
                    4000
                )
            );
        }
        if (!utils.isNullOrWhiteSpace(dataClient[i].programName)) {
            let programNameArr = dataClient[i].programName.split("\r\n");
            for (let item of programNameArr) {
                let program = await getProgramName(item);
                if (utils.isNullOrEmptyArray(program.recordset)) {
                    errMessage.push(
                        String.format(
                            variable.MESSAGE_ALL_EXIST,
                            line,
                            "ProgramName"
                        )
                    );
                }
            }
        }
        if (utils.isNullOrWhiteSpace(dataClient[i].clientTypeName)) {
            errMessage.push(
                String.format(
                    variable.MESSAGE_ALL_EMPTY,
                    line,
                    "ClientTypeName"
                )
            );
        }
        if (!utils.isNullOrWhiteSpace(dataClient[i].clientTypeName)) {
            const masterDataClientTypeName = await getClientTypeName(
                dataClient[i].clientTypeName
            );
            if (utils.isNullOrEmptyArray(masterDataClientTypeName.recordset)) {
                errMessage.push(
                    String.format(
                        variable.MESSAGE_ALL_EXIST,
                        line,
                        "ClientTypeName"
                    )
                );
            }
        }
        if (
            !utils.isNullOrWhiteSpace(dataClient[i].description) &&
            utils.isOverMaxLength(dataClient[i].description, 4000)
        ) {
            errMessage.push(
                String.format(
                    variable.MESSAGE_ALL_OVER_LENGTH,
                    line,
                    "Description",
                    4000
                )
            );
        }
        if (
            !utils.isNullOrWhiteSpace(dataClient[i].descriptionEN) &&
            utils.isOverMaxLength(dataClient[i].descriptionEN, 4000)
        ) {
            errMessage.push(
                String.format(
                    variable.MESSAGE_ALL_OVER_LENGTH,
                    line,
                    "DescriptionEN",
                    4000
                )
            );
        }
        if (utils.isNullOrWhiteSpace(dataClient[i].status)) {
            errMessage.push(
                String.format(variable.MESSAGE_ALL_EMPTY, line, "Status")
            );
        }
        if (!utils.isNullOrWhiteSpace(dataClient[i].status)) {
            const masterDataStatus = await getStatus(dataClient[i].status);
            if (utils.isNullOrEmptyArray(masterDataStatus.recordset)) {
                errMessage.push(
                    String.format(variable.MESSAGE_ALL_EXIST, line, "Status")
                );
            }
        }
        if (!utils.isNullOrWhiteSpace(dataClient[i].logo)) {
            var fileLogos = dataClient[i].logo.split("\r\n");
            if (fileLogos.length > 5) {
                errMessage.push(
                    String.format(
                        variable.MESSAGE_ALL_OVER_LENGTH,
                        line,
                        "File",
                        5
                    )
                );
            } else {
                fileLogos.forEach((item) => {
                    if (!fs.existsSync(item)) {
                        errMessage.push(
                            String.format(
                                variable.MESSAGE_ALL_EXIST,
                                line,
                                "File"
                            )
                        );
                    } else {
                        if (utils.getFilesizeInMegaBytes(item) > 10) {
                            errMessage.push(
                                String.format(
                                    variable.MESSAGE_ALL_OVER_SIZE,
                                    line,
                                    "File",
                                    10,
                                    "MB"
                                )
                            );
                        }
                    }
                });
            }
        }
    }
    if (!utils.isNullOrEmptyArray(errMessage)) {
        var result = {
            error: variable.ERR_CALL_API_SUCCESS,
            data: null,
            message: errMessage,
        };
        return result;
    }
    return false;
};
const validateClient = ({ name, status, service, description }, file) => {
    var errMessage = [];
    if (utils.isNullOrWhiteSpace(name)) {
        errMessage.push(String.format(variable.MESSAGE_EMPTY, "Name"));
    }
    if (!utils.isNullOrWhiteSpace(name) && utils.isOverMaxLength(name, 100)) {
        errMessage.push(
            String.format(variable.MESSAGE_OVER_LENGTH, "Name", 100)
        );
    }

    if (utils.isNullOrWhiteSpace(status)) {
        errMessage.push(String.format(variable.MESSAGE_EMPTY, "Status"));
    }

    if (utils.isNullOrWhiteSpace(service)) {
        errMessage.push(String.format(variable.MESSAGE_EMPTY, "Service"));
    }

    if (
        !utils.isNullOrWhiteSpace(description) &&
        utils.isOverMaxLength(description, 4000)
    ) {
        errMessage.push(
            String.format(variable.MESSAGE_OVER_LENGTH, "Description", 4000)
        );
    }
    if (!file || Object.keys(file).length === 0) {
        errMessage.push("No files were uploaded.");
    } else {
        const fileInput = file.sampleFile;
        if (Array.isArray(fileInput) && fileInput.length <= 5) {
            fileInput.forEach((element) => {
                if (element.truncated) {
                    errMessage.push(
                        String.format(
                            variable.MESSAGE_OVER_SIZE,
                            "File",
                            10,
                            "MB"
                        )
                    );
                }
            });
        }
        if (Array.isArray(fileInput) && fileInput.length > 5) {
            errMessage.push(
                String.format(variable.MESSAGE_OVER_LENGTH, "File", 5)
            );
        }
        if (typeof fileInput === "object" && !Array.isArray(fileInput)) {
            if (fileInput.truncated) {
                errMessage.push(
                    String.format(variable.MESSAGE_OVER_SIZE, "File", 10, "MB")
                );
            }
        }
    }
    if (!utils.isNullOrEmptyArray(errMessage)) {
        var result = {
            error: variable.ERR_CALL_API_SUCCESS,
            data: null,
            message: errMessage,
        };
        return result;
    }
    return false;
};

const exeTransactionImport = async (
    dataClientArr,
    dataClientProgramArr,
    dataMediaArr
) => {
    var connStr = config.CONFIG_CONNECT;
    await sql.connect(connStr);
    var logger = config.LOG4J.getLogger("logFile");
    logger.info("Begin exeTransactionImport.");
    const transaction = new sql.Transaction();
    await transaction.begin();
    try {
        const request = new sql.Request(transaction);
        //create Clients table
        const tbClients = new sql.Table("Clients");
        tbClients.create = true;
        tbClients.columns.add("Id", sql.VarChar(10), {
            nullable: false,
            primary: true,
        });
        tbClients.columns.add("Name", sql.NVarChar(200), {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("NameEN", sql.NVarChar(200), {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("ClientTypeId", sql.Int, {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("Description", sql.NVarChar(sql.MAX), {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("DescriptionEN", sql.NVarChar(sql.MAX), {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("VerificationField", sql.Int, {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("CreatedOn", sql.DateTime2(7), {
            nullable: true,
            primary: false,
        });
        tbClients.columns.add("CreatedBy", sql.NVarChar(200), {
            nullable: true,
            primary: false,
        });

        for (var i = 0; i <= dataClientArr.length - 1; i++) {
            tbClients.rows.add(
                dataClientArr[i].id,
                dataClientArr[i].name,
                dataClientArr[i].nameEN,
                dataClientArr[i].clientTypeId,
                dataClientArr[i].description,
                dataClientArr[i].descriptionEN,
                dataClientArr[i].statusId,
                dataClientArr[i].createdOn,
                dataClientArr[i].createdBy
            );
        }
        //create ClientPrograms table
        const tbClientPrograms = new sql.Table("clientPrograms");
        tbClientPrograms.create = true;
        tbClientPrograms.columns.add("clientId", sql.VarChar(10), {
            nullable: false,
            primary: true,
        });
        tbClientPrograms.columns.add("programId", sql.Int, {
            nullable: false,
            primary: true,
        });
        for (var i = 0; i <= dataClientProgramArr.length - 1; i++) {
            tbClientPrograms.rows.add(
                dataClientProgramArr[i].clientId,
                dataClientProgramArr[i].programId
            );
        }
        //create medias table
        const tbMedias = new sql.Table("medias");
        tbMedias.create = true;
        tbMedias.columns.add("MediaType", sql.NVarChar(50), {
            nullable: true,
            primary: false,
        });
        tbMedias.columns.add("MediaPath", sql.NVarChar(500), {
            nullable: true,
            primary: false,
        });
        tbMedias.columns.add("MediaHashName", sql.NVarChar(500), {
            nullable: true,
            primary: false,
        });
        tbMedias.columns.add("RelationId", sql.NVarChar(50), {
            nullable: true,
            primary: false,
        });
        tbMedias.columns.add("CreatedOn", sql.DateTime2(7), {
            nullable: true,
            primary: false,
        });
        tbMedias.columns.add("CreatedBy", sql.NVarChar(200), {
            nullable: true,
            primary: false,
        });
        for (var i = 0; i <= dataMediaArr.length - 1; i++) {
            tbMedias.rows.add(
                "Client_Logo",
                dataMediaArr[i].mediaPath,
                dataMediaArr[i].mediaHashName,
                dataMediaArr[i].relationId,
                dataMediaArr[i].createdOn,
                dataMediaArr[i].createdBy
            );
        }
        request.bulk(tbClients, (err, result) => {
            if (err) {
                transaction.rollback();
                logger.error(err.message);
            } else {
                request.bulk(tbClientPrograms, (err, result) => {
                    if (err) {
                        transaction.rollback();
                        logger.error(err.message);
                    } else {
                        request.bulk(tbMedias, (err, result) => {
                            if (err) {
                                const appDir = dirname(require.main.filename);
                                for (
                                    var i = 0;
                                    i <= dataMediaArr.length - 1;
                                    i++
                                ) {
                                    const removePath = join(
                                        appDir,
                                        "uploads",
                                        dataMediaArr[i].mediaHashName
                                    );
                                    if (fs.existsSync(removePath)) {
                                        fs.unlinkSync(removePath);
                                    }
                                }
                                transaction.rollback();
                                logger.error(err.message);
                            } else {
                                transaction.commit();
                            }
                        });
                    }
                });
            }
        });
        logger.info("End exeTransactionImport.");
    } catch (err) {
        transaction.rollback();
        logger.error(err.message);
    }
};

const exeTransactionInsert = async (clientData, file, userId) => {
    const pool = new sql.ConnectionPool(config.CONFIG_CONNECT);
    var logger = config.LOG4J.getLogger("logFile");
    logger.info("Begin exeTransactionInsert.");
    await pool.connect().then(async function () {
        const transaction = new sql.Transaction(pool);
        await transaction.begin(async (err) => {
            let rolledBack = false;
            transaction.on("rollback", (aborted) => {
                rolledBack = true;
            });
            var request = new sql.Request(transaction);
            try {
                var getDateTime = utils.customDateTime();
                var clientId = randomToken.generate(config.SIZE_RANDOM_TOKEN);
                let queryStatementClient = `INSERT INTO clients VALUES ('${clientId}','${clientData.name}', null ,'${clientData.service}',
                '${clientData.description}', null,'${clientData.status}', null, null, null, '${getDateTime}','${userId}', null, null, null)`;
                await request.query(queryStatementClient);

                if (!utils.isNullOrWhiteSpace(clientData.programId)) {
                    let queryStatementClientPrograms = `INSERT INTO ClientPrograms VALUES ('${clientId}', ${clientData.programId})`;
                    await request.query(queryStatementClientPrograms);
                }

                var dataFileArr = await uploadFileToServerAndAWS(file);
                var mediaStatements = [];
                for (let item of dataFileArr) {
                    mediaStatements.push(
                        await request
                            .query(
                                `INSERT INTO Medias VALUES (null, 'Client_Logo', '${item.pathAWS}', '${item.filename}', 
                                '${clientId}', null, '${getDateTime}', '${userId}', null, null)`
                            )
                            .catch((err) => {
                                if (err) {
                                    transaction.rollback((err) => {});
                                }
                            })
                    );
                }
                await Promise.all(mediaStatements).then((result) => {
                    transaction.commit((err) => {});
                });
                logger.info("End exeTransactionInsert.");
            } catch (err) {
                transaction.rollback((err) => {});
                logger.error(err.message);
            } finally {
                pool.close();
            }
        });
    });
};
const exeTransactionUpdate = async (clientData, file, userId, clientId) => {
    const pool = new sql.ConnectionPool(config.CONFIG_CONNECT);
    var logger = config.LOG4J.getLogger("logFile");
    logger.info("Begin exeTransactionUpdate.");
    await pool.connect().then(async function () {
        const transaction = new sql.Transaction(pool);
        await transaction.begin(async (err) => {
            let rolledBack = false;
            transaction.on("rollback", (aborted) => {
                rolledBack = true;
            });
            var request = new sql.Request(transaction);
            try {
                var getDateTime = utils.customDateTime();
                let queryStatementClient = `UPDATE clients SET name = '${clientData.name}', clientTypeId ='${clientData.service}',
                description = '${clientData.description}', VerificationField = '${clientData.status}',
                LastModifiedOn = '${getDateTime}', LastModifiedBy = '${userId}' WHERE id = '${clientId}'`;
                await request.query(queryStatementClient);

                if (!utils.isNullOrWhiteSpace(clientData.programId)) {
                    let queryStatementClientPrograms = `UPDATE ClientPrograms SET programId = ${clientData.programId} WHERE clientId = '${clientId}'`;
                    await request.query(queryStatementClientPrograms);
                }

                let queryStatementMediaFileName = `SELECT MediaHashName as fileName FROM Medias WHERE RelationId = '${clientId}'`;
                let getFileName = await request.query(
                    queryStatementMediaFileName
                );
                let fileNames = getFileName.recordset;
                if (!utils.isNullOrEmptyArray(fileNames)) {
                    const appDir = dirname(require.main.filename);
                    fileNames.forEach((fileName) => {
                        if (!utils.isNullOrWhiteSpace(fileName.fileName)) {
                            const removePath = join(
                                appDir,
                                "uploads",
                                fileName.fileName
                            );
                            if (fs.existsSync(removePath)) {
                                fs.unlinkSync(removePath);
                            }
                        }
                    });
                }
                let queryStatementMediaDel = `DELETE FROM Medias WHERE RelationId = '${clientId}'`;
                await request.query(queryStatementMediaDel);
                var dataFileArr = await uploadFileToServerAndAWS(file);
                var mediaStatements = [];
                for (let item of dataFileArr) {
                    mediaStatements.push(
                        await request
                            .query(
                                `INSERT INTO Medias VALUES (null, 'Client_Logo', '${item.pathAWS}', '${item.filename}', 
                                '${clientId}', null, '${getDateTime}', '${userId}', null, null)`
                            )
                            .catch((err) => {
                                if (err) {
                                    transaction.rollback((err) => {});
                                }
                            })
                    );
                }
                await Promise.all(mediaStatements).then((result) => {
                    transaction.commit((err) => {});
                });
                logger.info("End exeTransactionUpdate.");
            } catch (err) {
                transaction.rollback((err) => {});
                logger.error(err.message);
            } finally {
                pool.close();
            }
        });
    });
};
const uploadFileToServerAndAWS = async (file) => {
    const appDir = dirname(require.main.filename);
    const fileInput = file.sampleFile;
    var promises = [];
    var arrList = [];
    if (Array.isArray(fileInput) && fileInput.length <= 5) {
        for (let item of fileInput) {
            var filename = utils.getExtensionFromFileName(item.name);
            const savePath = join(appDir, "uploads", filename);
            promises.push(await item.mv(savePath));
            var pathAWS = await utils.uploadFileToAWSS3(savePath, filename);
            arrList.push({
                filename,
                pathAWS: await pathAWS,
            });
        }
        await Promise.all(arrList);
        await Promise.all(promises);
    }
    if (typeof fileInput === "object" && !Array.isArray(fileInput)) {
        var filename = utils.getExtensionFromFileName(fileInput.name);
        const savePath = join(appDir, "uploads", filename);
        await fileInput.mv(savePath);
        var pathAWS = await utils.uploadFileToAWSS3(savePath, filename);
        arrList.push({
            filename,
            pathAWS: await pathAWS,
        });
    }
    return arrList;
};

module.exports = {
    getClientWithJoin,
    getClientListWithProgramAttach,
    getClientByPaging,
    createClient,
    updateClient,
    getClientById,
    importFileClient,
    exportFileClient,
};
