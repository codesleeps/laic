import { serve } from "inngest/next";
import { 
  exampleCron, 
  weeklyReportCron, 
  taskReminderCron, 
  wasteAlertTrigger 
} from "@/inngest";
import { inngest } from "@/inngest/client";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    exampleCron,
    weeklyReportCron,
    taskReminderCron,
    wasteAlertTrigger,
  ],
  logLevel: "debug",
});
