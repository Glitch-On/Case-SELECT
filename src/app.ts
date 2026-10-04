import express from "express";
import { config } from "./config/index.ts";
import routes from "./routes/index.ts";
import { errorHandler, notFound } from "./middleware/errorHandler.ts";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(express.static(config.paths.public));
app.use("/views", express.static(config.paths.views));

app.use(routes);

app.get("/", (_req, res) => {
  res.sendFile("index.html", { root: config.paths.views });
});

app.use(notFound);
app.use(errorHandler);

export default app;
