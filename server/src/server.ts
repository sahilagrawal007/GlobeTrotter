import { env } from "./config/env";
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`🚀 GlobeTrotter server running on http://localhost:${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   AI Provider: ${env.AI_PROVIDER}`);
});
