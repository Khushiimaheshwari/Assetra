"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./NotificationBell.module.css";

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    if (diffMs < 60_000) return "Just now";
    if (diffMs < 3600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
    if (diffMs < 86400_000) return `${Math.floor(diffMs / 3600_000)}h ago`;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function idStr(v) {
  if (v == null || v === "") return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && v.$oid) return v.$oid;
  return String(v);
}

/**
 * Issue: /lab/[labMongoId]/asset/[pcMongoId] — second id is the PC document (PCs), not hardware asset.
 * Maintenance: AMC tracking + ?m= maintenance record id.
 */
function buildNotificationHref(role, n) {
  const labId = idStr(n.linkLabId);
  const pcId = idStr(n.linkPcId);
  const maintId = idStr(n.linkMaintenanceId);
  const type = n.type;

  if (type === "maintenance" && maintId) {
    return `/adminPanel/AMC_tracking?m=${encodeURIComponent(maintId)}`;
  }

  if (type === "issue" && labId && pcId) {
    if (role === "admin") {
      return `/adminPanel/lab_management/lab/${labId}/asset/${pcId}`;
    }
    if (role === "lab_technician") {
      return `/lab_technicianPanel/lab_management/lab/${labId}/asset/${pcId}`;
    }
    if (role === "faculty") {
      return `/facultyPanel/allLabs/lab/${labId}/asset/${pcId}`;
    }
  }

  return null;
}

function MarkReadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function NotificationBell({ buttonClassName }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(
        "/api/notifications?unreadOnly=true&limit=40",
        { credentials: "same-origin" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          setItems([]);
          setUnreadCount(0);
          return;
        }
        throw new Error(data.error || "Failed to load notifications");
      }
      setItems(data.notifications || []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
    } catch (e) {
      console.error(e);
      setError(e.message || "Could not load notifications");
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const markRead = async (id) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      if (!res.ok) return;
      setItems((prev) =>
        prev.filter((n) => String(n._id || n.id) !== String(id))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const openLinkedPage = (n) => {
    const href = buildNotificationHref(session?.user?.role, n);
    if (!href) return;
    setOpen(false);
    router.push(href);
  };

  const markAllRead = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setItems([]);
        setUnreadCount(0);
        await load();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const badge =
    unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={buttonClassName}
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.bellInner}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          {badge && <span className={styles.badge}>{badge}</span>}
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="dialog" aria-label="Notifications">
          <div className={styles.dropdownHeader}>
            <h2 className={styles.dropdownTitle}>Notifications</h2>
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={markAllRead}
              disabled={loading || items.length === 0}
            >
              Mark all read
            </button>
          </div>

          <div className={styles.list}>
            {error && <div className={styles.error}>{error}</div>}
            {!error && items.length === 0 && (
              <div className={styles.empty}>No unread notifications</div>
            )}
            {items.map((n) => {
              const id = n._id || n.id;
              const type = n.type || "issue";
              const href = buildNotificationHref(session?.user?.role, n);
              return (
                <div key={id} className={styles.itemRow}>
                  <button
                    type="button"
                    className={
                      href
                        ? `${styles.itemMain} ${styles.itemMainLink}`
                        : styles.itemMain
                    }
                    onClick={() => href && openLinkedPage(n)}
                  >
                    <div className={styles.itemTitle}>
                      <span>{n.title || "Notification"}</span>
                      <span
                        className={`${styles.typeTag} ${
                          type === "maintenance"
                            ? styles.typeMaintenance
                            : styles.typeIssue
                        }`}
                      >
                        {type}
                      </span>
                    </div>
                    <p className={styles.itemMessage}>{n.message || ""}</p>
                    <div className={styles.itemMeta}>
                      {formatTime(n.createdAt)}
                      {href ? (
                        <span className={styles.openHint}> · Open</span>
                      ) : null}
                    </div>
                  </button>
                  <button
                    type="button"
                    className={styles.markReadBtn}
                    aria-label="Mark as read"
                    title="Mark as read"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markRead(id);
                    }}
                  >
                    <MarkReadIcon />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
