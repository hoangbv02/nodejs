"use strict";
const express = require("express");
const config = require("./common/config");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const eventRouter = require("./routes/eventRoutes");
const clientRouter = require("./routes/clientRoutes");
const userRouter = require("./routes/userRoutes");
const fileRouter = require("./routes/fileRoutes");
const fileUpload = require("express-fileupload");

app.use(cors());
app.use(
    fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 },
    })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", eventRouter.routers);
app.use("/api", clientRouter.routeClients);
app.use("/api", userRouter.routers);
app.use("/api", fileRouter.routerFile);

app.listen(config.port, () =>
    console.log("Server is listening on http://localhost" + config.port)
);
