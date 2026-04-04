export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { registerIssueListeners } = await import("./events/issueEventListener");
  registerIssueListeners();

  const { startIssueOverdueCron } = await import("./cron/issueOverdueCron");
  startIssueOverdueCron();
}
