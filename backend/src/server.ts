import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { scheduleReminderJob } from "./jobs/sendReminders.job.js";

const app = createApp();
const port = Number(env.PORT);

app.listen(port, () => {
  console.log(`PC Legacy Hyderabad API running on port ${port} [${env.NODE_ENV}]`);
  console.log(`Health check: http://localhost:${port}/api/v1/health`);
  scheduleReminderJob();
});