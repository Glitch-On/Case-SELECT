import app from "./app.ts";
import { config } from "./config/index.ts";

app.listen(config.port, () => {
  console.log(`SQL IDE listening on http://localhost:${config.port}`);
  console.log(`Database mode: ${config.dbMode}`);
});
