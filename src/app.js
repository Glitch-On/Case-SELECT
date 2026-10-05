import express from "express";

import { config } from "./config/index.js";
import routes from "./routes/index.js";
import caseRouter from "./routes/case.router.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(express.static(config.paths.public));

app.use("/views", express.static(config.paths.views));

app.use(routes);

app.use("/api/cases", caseRouter);

app.get("/", (_req, res) => {
    res.sendFile("index.html", { root: config.paths.views });
});

app.use(notFound);

app.use(errorHandler);

export default app;