import { EventEmitter } from "events";

export const MAINTENANCE_EVENTS = {
  CREATED: "MAINTENANCE_CREATED",
  STATUS_CHANGED: "MAINTENANCE_STATUS_CHANGED",
};

export const ISSUE_EVENTS = {
  CREATED: "ISSUE_CREATED",
  PENDING_TO_RESOLVED: "ISSUE_PENDING_TO_RESOLVED",
  RESOLVED_TO_APPROVED: "ISSUE_RESOLVED_TO_APPROVED",
};

const appEventEmitter = new EventEmitter();
appEventEmitter.setMaxListeners(30);

export default appEventEmitter;
