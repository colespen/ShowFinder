import { createApp } from "./app.ts";
import { env } from "./config/env.ts";

createApp().listen(env.port, () => {
  console.log(`Server listening on port ${env.port} `);
});
