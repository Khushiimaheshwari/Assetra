import appEventEmitter, { ISSUE_EVENTS } from "./appEventEmitter";
import * as issueActions from "../services/issueNotificationActions";

let listenersRegistered = false;

function wrap(handler) {
  return (payload) => {
    Promise.resolve(handler(payload)).catch((err) => {
      console.error("[issueEventListener]", err);
    });
  };
}

export function registerIssueListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  appEventEmitter.on(
    ISSUE_EVENTS.CREATED,
    wrap(issueActions.onIssueCreated)
  );
  appEventEmitter.on(
    ISSUE_EVENTS.PENDING_TO_RESOLVED,
    wrap(issueActions.onIssuePendingToResolved)
  );
  appEventEmitter.on(
    ISSUE_EVENTS.RESOLVED_TO_APPROVED,
    wrap(issueActions.onIssueResolvedToApproved)
  );
}
