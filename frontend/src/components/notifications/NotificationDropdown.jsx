import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCheck } from "lucide-react";

import api from "../../api/axios";

const NotificationDropdown = ({ onReadAll }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await api.get("/notifications");
      const list = Array.isArray(res.data?.notifications)
        ? res.data.notifications
        : [];

      setNotifications(list.slice(0, 20));
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      // Propagate to parent so the bell badge resets
      onReadAll?.();
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Group notifications by week (week field on notification, fallback to "General")
  const grouped = useMemo(() => {
    const map = {};
    for (const n of notifications) {
      const key = n.week ? `Week ${n.week}` : "General";
      if (!map[key]) map[key] = [];
      map[key].push(n);
    }
    return Object.entries(map);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="
      absolute
      right-0
      top-12
      w-96
      bg-[#0f172a]
      border
      border-slate-800
      rounded-2xl
      shadow-2xl
      z-50
      overflow-hidden
    "
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-white">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 transition disabled:opacity-50"
            title="Mark all as read"
          >
            <CheckCheck size={14} />
            {markingAll ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-sm text-slate-400">Loading...</p>
        ) : error ? (
          <p className="p-4 text-sm text-slate-400">
            Couldn&apos;t load notifications. Please try again.
          </p>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-sm text-slate-400">You&apos;re all caught up.</p>
        ) : (
          grouped.map(([weekLabel, items]) => (
            <div key={weekLabel}>
              {/* Week group header */}
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60">
                <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                  {weekLabel}
                </p>
              </div>

              {items.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border-b border-slate-800 hover:bg-slate-800/50 flex items-start gap-3 ${
                    !n.read ? "bg-violet-950/20" : ""
                  }`}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-violet-500" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">{n.message}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkOneRead(n._id)}
                      className="shrink-0 text-xs text-slate-400 hover:text-violet-400 transition"
                      title="Mark as read"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <Link
        to="/notifications"
        className="block p-3 text-center text-sm text-violet-400 hover:text-violet-300 border-t border-slate-800"
      >
        View all notifications
      </Link>
    </div>
  );
};

export default NotificationDropdown;
