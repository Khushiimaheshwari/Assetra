import cron from "node-cron";
import { runOverdueIssueCheck } from "../services/issueOverdueProcessor";

/**
 * Daily job: overdue pending issues (7d+) — faculty, technician, admins; weekly repeat.
 */
export function startIssueOverdueCron() {
  if (globalThis.__assetraIssueCronStarted) return;
  globalThis.__assetraIssueCronStarted = true;

  const schedule = process.env.ISSUE_OVERDUE_CRON || "0 8 * * *";

  cron.schedule(
    schedule,
    async () => {
      try {
        await runOverdueIssueCheck();
      } catch (err) {
        console.error("[issueOverdueCron]", err);
      }
    },
    { timezone: process.env.CRON_TZ || "UTC" }
  );

  console.log(`[issueOverdueCron] scheduled (${schedule}, TZ=${process.env.CRON_TZ || "UTC"})`);
}
